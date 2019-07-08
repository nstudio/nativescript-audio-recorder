import * as permissions from 'nativescript-permissions';
import * as app from 'tns-core-modules/application';
import { device } from 'tns-core-modules/platform/platform';
import { AudioRecorderOptions } from './options';
import { LOG_DEBUG, LOG_ERROR, TNSRecordI } from './recorder.common';

export class AudioRecorder implements TNSRecordI {
  static DEVICE_CAN_RECORD(): boolean {
    const pManager = app.android.context.getPackageManager();
    const canRecord = pManager.hasSystemFeature(
      android.content.pm.PackageManager.FEATURE_MICROPHONE
    );
    if (canRecord) {
      return true;
    } else {
      return false;
    }
  }

  private _recorder: android.media.MediaRecorder;

  private _isRecording: boolean;
  get android() {
    return this._recorder;
  }

  // android does not keep track of recording state and leaves it to developer to implement
  // so this plugin will attempt to track a simple boolean that we'll toggle during method calls
  get isRecording() {
    return this._isRecording;
  }

  set isRecording(value) {
    if (this._recorder && value) {
      this._isRecording = value;
    }
  }

  constructor() {
    this._recorder = new android.media.MediaRecorder();
    this._isRecording = false;
  }

  public requestRecordPermission(explanation = '') {
    return new Promise((resolve, reject) => {
      permissions
        .requestPermission(android.Manifest.permission.RECORD_AUDIO)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public requestStoragePermission(explanation = '') {
    return new Promise((resolve, reject) => {
      permissions
        .requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public start(options: AudioRecorderOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestStoragePermission()
        .then(() => {
          // bake the permission into this so the dev doesn't have to call it
          this.requestRecordPermission()
            .then(() => {
              if (this._recorder) {
                // reset for reuse
                this._recorder.reset();
              } else {
                console.log(
                  LOG_DEBUG,
                  'Recorder is not initialized, creating new instance of android MediaRecorder.'
                );
                this._recorder = new android.media.MediaRecorder();
              }

              const audioSource = options.source ? options.source : 0;
              console.log(LOG_DEBUG, 'Setting audio source', audioSource);
              this._recorder.setAudioSource(audioSource);

              const outFormat = options.format ? options.format : 0;
              console.log(LOG_DEBUG, 'Setting output format', outFormat);
              this._recorder.setOutputFormat(outFormat);

              const encoder = options.encoder ? options.encoder : 0;
              console.log(LOG_DEBUG, 'Setting audio encoder', encoder);
              this._recorder.setAudioEncoder(encoder);

              if (options.channels) {
                this._recorder.setAudioChannels(options.channels);
              }
              if (options.sampleRate) {
                this._recorder.setAudioSamplingRate(options.sampleRate);
              }
              if (options.bitRate) {
                this._recorder.setAudioEncodingBitRate(options.bitRate);
              }

              this._recorder.setOutputFile(options.filename);

              // On Error
              this._recorder.setOnErrorListener(
                new android.media.MediaRecorder.OnErrorListener({
                  onError: (recorder: any, error: number, extra: number) => {
                    options.errorCallback({ recorder, error, extra });
                  }
                })
              );

              // On Info
              this._recorder.setOnInfoListener(
                new android.media.MediaRecorder.OnInfoListener({
                  onInfo: (recorder: any, info: number, extra: number) => {
                    options.infoCallback({ recorder, info, extra });
                  }
                })
              );

              this._recorder.prepare();
              this._recorder.start();
              this._isRecording = true;
              console.log(LOG_DEBUG, 'Android AudioRecorder has started.');

              resolve(true);
            })
            .catch(err => {
              console.log(
                LOG_ERROR,
                'Permission to record audio is not granted.',
                err
              );
              this._isRecording = false;
              reject('Permission to record audio is not granted.');
              return;
            });
        })
        .catch(err => {
          console.log(
            LOG_ERROR,
            'Permission to device storage is not granted.',
            err
          );
          this._isRecording = false;
          reject('Permission to device storage is not granted.');
          return;
        });
    });
  }

  public stop(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder && this._isRecording === true) {
        console.log(LOG_DEBUG, 'Stopping...');
        this._recorder.stop();
        this._isRecording = false;
        resolve(true);
      } else {
        console.log(LOG_DEBUG, 'Recorder is not recording.');
        resolve(false);
      }
    });
  }

  public pause(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder && this._isRecording && device.sdkVersion >= '24') {
        console.log(LOG_DEBUG, 'Pausing...');
        this._recorder.pause();
        this._isRecording = false;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public resume(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder && device.sdkVersion >= '24') {
        console.log(LOG_DEBUG, 'Resuming...');
        this._recorder.resume();
        this._isRecording = true;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public dispose(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder) {
        console.log(LOG_DEBUG, 'Disposing...');
        this._recorder.release();
        this._recorder = undefined;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public getMeters(): number {
    if (this._recorder) {
      return this._recorder.getMaxAmplitude();
    } else {
      console.log(
        LOG_DEBUG,
        'No active recorder, so no meter data can be reported.'
      );
      return null;
    }
  }
}
