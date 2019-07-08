import { AudioRecorderOptions } from './options';
import { LOG_DEBUG, LOG_ERROR, TNSRecordI } from './recorder.common';

export class AudioRecorder extends NSObject implements TNSRecordI {
  public static ObjCProtocols = [AVAudioRecorderDelegate];
  public static DEVICE_CAN_RECORD(): boolean {
    return true;
  }

  private _recorder: AVAudioRecorder;
  private _recordingSession: AVAudioSession;

  get ios() {
    return this._recorder;
  }

  // iOS tracks internally if recording is happening to just return the recorder values
  get isRecording() {
    return this._recorder && this._recorder.recording;
  }

  public requestRecordPermission() {
    return new Promise((resolve, reject) => {
      this._recordingSession.requestRecordPermission((allowed: boolean) => {
        if (allowed) {
          resolve(true);
        } else {
          reject('Record permissions denied');
        }
      });
    });
  }

  public start(options: AudioRecorderOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this._recordingSession = AVAudioSession.sharedInstance();
        let errorRef = new interop.Reference();
        this._recordingSession.setCategoryError(
          AVAudioSessionCategoryPlayAndRecord
        );

        if (errorRef) {
          console.log(LOG_DEBUG, `setCategoryError: ${errorRef.value}`);
        }

        this._recordingSession.setActiveError(true);
        this._recordingSession.requestRecordPermission((allowed: boolean) => {
          if (allowed) {
            const recordSetting = NSDictionary.alloc().init() as NSDictionary<
              string,
              any
            >;
            recordSetting.setValueForKey(
              NSNumber.numberWithInt(kAudioFormatMPEG4AAC),
              AVFormatIDKey
            );
            recordSetting.setValueForKey(
              NSNumber.numberWithInt(AVAudioQuality.Medium),
              AVEncoderAudioQualityKey
            );
            recordSetting.setValueForKey(
              NSNumber.numberWithFloat(16000.0),
              AVSampleRateKey
            );
            recordSetting.setValueForKey(
              NSNumber.numberWithInt(1),
              AVNumberOfChannelsKey
            );

            errorRef = new interop.Reference();

            const url = NSURL.fileURLWithPath(options.filename);

            this._recorder = AVAudioRecorder.alloc().initWithURLSettingsError(
              url,
              recordSetting
            );

            if (errorRef && errorRef.value) {
              console.log(LOG_DEBUG, errorRef.value);
            } else {
              this._recorder.delegate = this;
              if (options.metering) {
                this._recorder.meteringEnabled = true;
              }
              this._recorder.prepareToRecord();
              this._recorder.record();
              resolve(true);
            }
          }
        });
      } catch (ex) {
        console.log(LOG_ERROR, 'start()', ex);
        reject(ex);
      }
    });
  }

  public stop(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder && this._recorder.recording) {
        console.log(LOG_DEBUG, 'Stopping...');
        this._recorder.stop();
        this._recorder.meteringEnabled = false;
        resolve(true);
      } else {
        console.log(LOG_DEBUG, 'Recorder is not recording.');
        resolve(false);
      }
    });
  }

  public pause(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder && this._recorder.recording) {
        console.log(LOG_DEBUG, 'Pausing...');
        this._recorder.pause();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public resume(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._recorder) {
        console.log(LOG_DEBUG, 'Resuming...');
        this._recorder.record();
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
        this._recorder.stop();
        this._recorder.meteringEnabled = false;
        this._recordingSession.setActiveError(false);
        this._recorder = undefined;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public getMeters(channel?: number): number {
    if (this._recorder) {
      if (!this._recorder.meteringEnabled) {
        this._recorder.meteringEnabled = true;
      }
      this._recorder.updateMeters();
      return this._recorder.averagePowerForChannel(channel);
    } else {
      console.log(
        LOG_DEBUG,
        'No active recorder, so no meter data can be reported.'
      );
      return null;
    }
  }

  public audioRecorderDidFinishRecording(recorder: any, success: boolean) {
    console.log(LOG_DEBUG, `audioRecorderDidFinishRecording: ${success}`);
  }
}
