// src/lib/ai-generation/polly-service.js
import {
    PollyClient,
    SynthesizeSpeechCommand,
    StartSpeechSynthesisTaskCommand,
    GetSpeechSynthesisTaskCommand
  } from "@aws-sdk/client-polly";
  import fs from 'fs';
  import path from 'path';
  import { s3Client } from '../s3-utils';
  import { PutObjectCommand } from '@aws-sdk/client-s3';
  
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  const TEMP_DIR = path.join(process.cwd(), 'tmp');
  
  // Initialize Polly client
  const pollyClient = new PollyClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
  
  /**
   * Convert script text to speech using Amazon Polly
   * @param {Object} params Parameters for speech synthesis
   * @param {string} params.text The text to convert to speech
   * @param {string} params.voiceId The Polly voice ID to use
   * @param {string} params.outputFormat The output audio format
   * @param {string} params.engine The speech synthesis engine to use
   * @returns {Promise<Buffer>} The audio data
   */
  export async function synthesizeSpeech({
    text,
    voiceId = 'Matthew', // Default to a natural-sounding male voice
    outputFormat = 'mp3',
    engine = 'neural', // Use neural engine for higher quality
  }) {
    try {
      // For short texts, use direct synthesis
      if (text.length < 1500) {
        return await synthesizeShortSpeech({ text, voiceId, outputFormat, engine });
      } else {
        // For longer texts, use asynchronous synthesis
        return await synthesizeLongSpeech({ text, voiceId, outputFormat, engine });
      }
    } catch (error) {
      console.error('Error synthesizing speech with Amazon Polly:', error);
      throw new Error('Failed to synthesize speech');
    }
  }
  
  /**
   * Synthesize speech for short text content
   */
  async function synthesizeShortSpeech({
    text,
    voiceId,
    outputFormat,
    engine,
  }) {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      OutputFormat: outputFormat,
      Engine: engine,
      TextType: 'ssml', // Use SSML for more control over speech
    });
  
    // Wrap the text with SSML tags if it doesn't already have them
    if (!text.startsWith('<speak>')) {
      command.input.Text = `<speak>${text}</speak>`;
    }
  
    const response = await pollyClient.send(command);
    
    // Convert the audio stream to a buffer
    return streamToBuffer(response.AudioStream);
  }
  
  /**
   * Synthesize speech for longer text content using asynchronous task
   */
  async function synthesizeLongSpeech({
    text,
    voiceId,
    outputFormat,
    engine,
  }) {
    // Create a unique S3 key for the audio file
    const timestamp = Date.now();
    const s3Key = `audio/polly-${timestamp}.${outputFormat}`;
  
    // Wrap the text with SSML tags if it doesn't already have them
    let ssmlText = text;
    if (!text.startsWith('<speak>')) {
      ssmlText = `<speak>${text}</speak>`;
    }
  
    const command = new StartSpeechSynthesisTaskCommand({
      Text: ssmlText,
      VoiceId: voiceId,
      OutputFormat: outputFormat,
      Engine: engine,
      TextType: 'ssml',
      OutputS3BucketName: BUCKET_NAME,
      OutputS3KeyPrefix: s3Key.split('/')[0], // Use the 'audio' folder as prefix
    });
  
    const response = await pollyClient.send(command);
    const taskId = response.SynthesisTask.TaskId;
  
    // Poll the task status until completed
    let taskStatus = 'inProgress';
    let audioUrl = null;
    
    while (taskStatus === 'inProgress' || taskStatus === 'scheduled') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const statusCommand = new GetSpeechSynthesisTaskCommand({ TaskId: taskId });
      const statusResponse = await pollyClient.send(statusCommand);
      
      taskStatus = statusResponse.SynthesisTask.TaskStatus;
      if (taskStatus === 'completed') {
        audioUrl = statusResponse.SynthesisTask.OutputUri;
        break;
      } else if (taskStatus === 'failed') {
        throw new Error(`Speech synthesis task failed: ${statusResponse.SynthesisTask.TaskStatusReason}`);
      }
    }
  
    if (!audioUrl) {
      throw new Error('Failed to get audio URL from Polly task');
    }
  
    // Download the audio file from S3
    const downloadResponse = await fetch(audioUrl);
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download audio from S3: ${downloadResponse.statusText}`);
    }
  
    const arrayBuffer = await downloadResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  /**
   * Convert a readable stream to a buffer
   */
  async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
  
  /**
   * Upload the audio buffer to S3 and return the URL
   * @param {Buffer} audioBuffer The audio data buffer
   * @param {string} fileName The name to save the file as
   * @param {string} contentType The MIME type of the audio
   * @returns {Promise<string>} The S3 URL of the uploaded audio
   */
  export async function uploadAudioToS3(audioBuffer, fileName, contentType = 'audio/mp3') {
    const key = `audio/${fileName}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: audioBuffer,
      ContentType: contentType,
    };
  
    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      // Return the S3 URL
      return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading audio to S3:', error);
      throw new Error('Failed to upload audio to S3');
    }
  }
  
  /**
   * Process a script for TTS by adding SSML markers for better pronunciation
   * @param {string} script The raw script text
   * @returns {string} The script with SSML enhancements
   */
  export function enhanceScriptWithSSML(script) {
    // Add pauses after sentences
    let enhancedScript = script.replace(/\./g, '.<break time="0.5s"/>');
    
    // Add emphasis to key phrases (this is just an example - in a real app you'd
    // have more sophisticated detection of important phrases)
    enhancedScript = enhancedScript.replace(
      /(championship|record|greatest|legendary|iconic|famous)/gi, 
      '<emphasis level="moderate">$1</emphasis>'
    );
    
    // Improve pronunciation of player names and terms
    // This would be expanded with a larger database of sports terms in a real application
    const pronunciationDict = {
      'Giannis Antetokounmpo': 'Yannis Adetokunbo',
      'Dirk Nowitzki': 'Dirk No-vit-ski',
      // Add more sports-specific pronunciations as needed
    };
    
    Object.entries(pronunciationDict).forEach(([term, pronunciation]) => {
      const regex = new RegExp(term, 'gi');
      enhancedScript = enhancedScript.replace(
        regex,
        `<phoneme alphabet="ipa" ph="${pronunciation}">${term}</phoneme>`
      );
    });
    
    // Wrap the entire script in speak tags
    return `<speak>${enhancedScript}</speak>`;
  }