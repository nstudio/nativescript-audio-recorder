import * as fs from 'tns-core-modules/file-system';
import { isString } from 'tns-core-modules/utils/types';
import { AudioRecorderOptions } from './options';

export const LOG_DEBUG = '@nstudio/nativescript-audio-recorder --- DEBUG:';
export const LOG_ERROR = '@nstudio/nativescript-audio-recorder --- ERROR:';

export interface TNSRecordI {
  /**
   * Starts the native audio recording control.
   */
  start(options: AudioRecorderOptions): Promise<any>;

  /**
   * Pauses the native audio recording control.
   */
  pause(): Promise<any>;

  /**
   * Resumes the native audio recording control.
   */
  resume(): Promise<any>;

  /**
   * Stops the native audio recording control.
   */
  stop(): Promise<any>;

  /**
   * Releases resources from the recorder.
   */
  dispose(): Promise<any>;
}

/**
 * Helper function to determine if string is a url.
 * @param value [string]
 */
export function isStringUrl(value: string): boolean {
  // check if artURL is a url or local file
  let isURL = false;
  if (value.indexOf('://') !== -1) {
    if (value.indexOf('res://') === -1) {
      isURL = true;
    }
  }
  if (isURL === true) {
    return true;
  } else {
    return false;
  }
}

/**
 * Will determine if a string is a url or a local path. If the string is a url it will return the url.
 * If it is a local path, then the file-system module will return the file system path.
 * @param path [string]
 */
export function resolveAudioFilePath(path: string) {
  if (path) {
    const isUrl = isStringUrl(path);
    // if it's a url just return the audio file url
    if (isUrl === true) {
      return path;
    } else {
      let audioPath;
      let fileName = isString(path) ? path.trim() : '';
      if (fileName.indexOf('~/') === 0) {
        fileName = fs.path.join(
          fs.knownFolders.currentApp().path,
          fileName.replace('~/', '')
        );
        audioPath = fileName;
      } else {
        audioPath = fileName;
      }
      return audioPath;
    }
  }
}
