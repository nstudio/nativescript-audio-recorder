import { AudioRecorderOptions } from './options';

export declare class AudioRecorder {
  /**
   * Static method that returns true if the device is capable of recording audio.
   * Typically this means it must have at least one microphone.
   */
  static DEVICE_CAN_RECORD(): boolean;
  private _recorder;

  /**
   * Recorder instance on Android: android.media.MediaRecorder
   * https://developer.android.com/reference/android/media/MediaRecorder
   */
  readonly android: android.media.MediaRecorder;

  /**
   * Recorder instance on iOS: AVAudioRecorder
   * https://developer.apple.com/documentation/avfoundation/avaudiorecorder
   */
  readonly ios: AVAudioRecorder;

  /**
   * Boolean to track the recording state of the AudioRecorder.
   * iOS provides a built in recording boolean on the native AVAudioRecorder.
   * Android requires the developer to track state, so this plugin has some monitoring during method calls to set the boolean state.
   */
  isRecording: boolean;
  constructor();

  /**
   * Requests the OS Permission to record audio.
   */
  requestRecordPermission(): Promise<unknown>;

  /**
   * Requests the OS Permission to write to storage.
   */
  requestStoragePermission(): Promise<unknown>;

  /**
   * Starts recording audio.
   * On Android, this will prompt the user for the necessary permissions (storage, record_audio).
   * @param options [AudioRecorderOptions] - The options to start the recording session with.
   */
  start(options: AudioRecorderOptions): Promise<boolean>;

  /**
   * Stops recording.
   */
  stop(): Promise<boolean>;

  /**
   * Pauses recording.
   */
  pause(): Promise<boolean>;

  /**
   * Resumes recording.
   */
  resume(): Promise<boolean>;

  /**
   * Dispose of the native recorder. Only use this when done recording entirely.
   * It's best to create a new instance of the AudioRecorder after you do this.
   */
  dispose(): Promise<boolean>;
  getMeters(): number;
}

export interface AudioRecorderOptions {
  /**
   * Gets or sets the recorded file name.
   */
  filename: string;

  /**
   * Sets the source for recording ***ANDROID ONLY for now ***
   */
  source?: any;

  /**
   * Gets or set the max duration of the recording session.
   */
  maxDuration?: number;

  /**
   * Enable metering. Off by default.
   */
  metering?: boolean;

  /**
   * Format
   */
  format?: any;

  /**
   * Channels
   */
  channels?: any;

  /**
   * Sampling rate
   */
  sampleRate?: any;

  /**
   * Bit rate
   */
  bitRate?: any;

  /**
   * Encoding
   */
  encoder?: any;

  /**
   * Gets or sets the callback when an error occurs with the media recorder.
   * @returns {Object} An object containing the native values for the error callback.
   */
  errorCallback?: Function;

  /**
   * Gets or sets the callback to be invoked to communicate some info and/or warning about the media or its playback.
   * @returns {Object} An object containing the native values for the info callback.
   */
  infoCallback?: Function;
}
