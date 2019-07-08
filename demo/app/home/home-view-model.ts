import { AudioRecorder, AudioRecorderOptions } from '@nstudio/nativescript-audio-recorder';
import { Observable } from 'tns-core-modules/data/observable';
import { File, knownFolders } from 'tns-core-modules/file-system';
import { isAndroid } from 'tns-core-modules/platform';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { Prop } from '../prop';

export class HomeViewModel extends Observable {
  @Prop() isRecording;
  @Prop() recordedAudioFile;
  @Prop() audioMeter = 0;

  private _recorder: AudioRecorder;
  private _meterInterval: any;

  constructor() {
    super();
    this._recorder = new AudioRecorder();
    console.log('recorder', this._recorder);
  }

  async startRecording() {
    if (!AudioRecorder.DEVICE_CAN_RECORD()) {
      dialogs.alert({
        message: 'This device cannot record audio.',
        okButtonText: 'Okay'
      });
      return;
    }

    const audioFolder = knownFolders.currentApp().getFolder('audio');
    console.log(JSON.stringify(audioFolder));

    let androidFormat;
    let androidEncoder;
    if (isAndroid) {
      androidFormat = android.media.MediaRecorder.OutputFormat.MPEG_4;
      androidEncoder = android.media.MediaRecorder.AudioEncoder.AAC;
    }

    const recorderOptions: AudioRecorderOptions = {
      filename: `${audioFolder.path}/recording.${this.platformExtension()}`,

      format: androidFormat,

      encoder: androidEncoder,

      metering: true,

      infoCallback: infoObject => {
        console.log(JSON.stringify(infoObject));
      },

      errorCallback: errorObject => {
        console.log(JSON.stringify(errorObject));
      }
    };

    const result = await this._recorder.start(recorderOptions).catch(err => {
      dialogs.alert({
        message: `Start Error: ${err}`,
        okButtonText: 'Okay'
      });
    });

    if (result === true) {
      console.log(this._recorder.isRecording);
      this.isRecording = this._recorder.isRecording;
      if (recorderOptions.metering) {
        this._initMeter();
      }
    }
  }

  async pauseRecording() {
    const result = await this._recorder.pause().catch(err => {
      dialogs.alert({
        message: `Pause Error: ${err}`,
        okButtonText: 'Okay'
      });
    });
    console.log('pause result', result);
    this.isRecording = this._recorder.isRecording;
  }

  async resumeRecording() {
    const result = await this._recorder.resume().catch(err => {
      dialogs.alert({
        message: `Resume Error: ${err}`,
        okButtonText: 'Okay'
      });
    });
    console.log('resume result', result);
    this.isRecording = this._recorder.isRecording;
  }

  async stopRecording() {
    this._resetMeter();

    const stopResult = await this._recorder.stop().catch(err => {
      dialogs.alert({
        message: `Stop Error: ${err}`,
        okButtonText: 'Okay'
      });
      this._resetMeter();
    });
    if (stopResult) {
      console.log(this._recorder.isRecording);
      this.isRecording = this._recorder.isRecording;
    }
  }

  public getFile() {
    try {
      const audioFolder = knownFolders.currentApp().getFolder('audio');
      const recordedFile = audioFolder.getFile(
        `recording.${this.platformExtension()}`
      );
      console.log(JSON.stringify(recordedFile));
      console.log('recording exists: ' + File.exists(recordedFile.path));
      this.recordedAudioFile = recordedFile.path;
    } catch (ex) {
      console.log(ex);
    }
  }

  public async disposeRecorder() {
    const disposeResult = await this._recorder.dispose().catch(err => {
      dialogs.alert({
        message: `Dispose Error: ${err}`,
        okButtonText: 'Okay'
      });
    });
    console.log('disposeResult', disposeResult);
    this._recorder = new AudioRecorder();
  }

  private platformExtension() {
    // 'mp3'
    return `${isAndroid ? 'm4a' : 'caf'}`;
  }

  private _initMeter() {
    this._resetMeter();
    this._meterInterval = setInterval(() => {
      this.audioMeter = this._recorder.getMeters();
      console.log(this.audioMeter);
    }, 300);
  }

  private _resetMeter() {
    if (this._meterInterval) {
      this.audioMeter = 0;
      clearInterval(this._meterInterval);
      this._meterInterval = undefined;
    }
  }
}
