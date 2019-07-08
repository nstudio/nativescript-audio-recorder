<a align="center" href="https://www.npmjs.com/package/nativescript-audio-recorder">
    <h3 align="center">NativeScript Audio Recorder</h3>
</a>
<h4 align="center">NativeScript plugin to record audio on Android and iOS.</h4>

<p align="center">
    <a href="https://www.npmjs.com/package/nativescript-audio-recorder">
        <img src="https://img.shields.io/npm/v/nativescript-audio-recorder.svg" alt="npm">
    </a>
    <a href="https://www.npmjs.com/package/nativescript-audio-recorder">
        <img src="https://img.shields.io/npm/dt/nativescript-audio-recorder.svg?label=npm%20downloads" alt="npm">
    </a>
    <a href="https://github.com/nstudio/nativescript-audio-recorder/stargazers">
        <img src="https://img.shields.io/github/stars/nstudio/nativescript-audio-recorder.svg" alt="stars">
    </a>
     <a href="https://github.com/nstudio/nativescript-audio-recorder/network">
        <img src="https://img.shields.io/github/forks/nstudio/nativescript-audio-recorder.svg" alt="forks">
    </a>
    <a href="https://github.com/nstudio/nativescript-audio-recorder/blob/master/LICENSE.md">
        <img src="https://img.shields.io/github/license/nstudio/nativescript-audio-recorder.svg" alt="license">
    </a>
    <a href="http://nstudio.io">
      <img src="https://github.com/nstudio/media/blob/master/images/nstudio-banner.png?raw=true" alt="nStudio banner">
    </a>
    <h5 align="center">Do you need assistance on your project or plugin? Contact the nStudio team anytime at <a href="mailto:team@nstudio.io">team@nstudio.io</a> to get up to speed with the best practices in mobile and web app development.
    </h5>
</p>

---

## Installation

`tns plugin add @nstudio/nativescript-audio-recorder`

## Usage

```typescript
import {
  AudioRecorder,
  AudioRecorderOptions
} from '@nstudio/nativescript-audio-recorder';
import { File, knownFolders } from 'tns-core-modules/file-system';
import { isAndroid } from 'tns-core-modules/platform';

export class SomeClassInYourProject {
  private _recorder: AudioRecorder;

  constructor() {
    this._recorder = new AudioRecorder();
  }

  public startRecordingAudio() {
    if (!AudioRecorder.DEVICE_CAN_RECORD()) {
      console.log('crud, this device cannot record audio');
      return;
    }

    const audioFolder = knownFolders.currentApp().getFolder('audio');

    let androidFormat;
    let androidEncoder;
    if (isAndroid) {
      androidFormat = android.media.MediaRecorder.OutputFormat.MPEG_4;
      androidEncoder = android.media.MediaRecorder.AudioEncoder.AAC;
    }

    const recorderOptions: AudioRecorderOptions = {
      filename: `${audioFolder.path}/recording.${isAndroid ? 'm4a' : 'caf'}`,

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

    this._recorder
      .start(recorderOptions)
      .then(result => {
        console.log('recording has started', result);
      })
      .catch(err => {
        console.log('oh no, something is wrong and recording did not start');
      });
  }

  public pauseRecording() {
    this._recorder
      .pause()
      .then(result => {
        console.log('recording has been paused');
      })
      .catch(err => {
        console.log('recording could not be paused');
      });
  }

  public async stopRecording() {
    const stopResult = await this._recorder.stop().catch(err => {
      console.log('oh no recording did not stop correctly');
    });
    if (stopResult) {
      console.log('recording stopped successfully.');
    }
  }

  public getFile() {
    try {
      const audioFolder = knownFolders.currentApp().getFolder('audio');
      const recordedFile = audioFolder.getFile(
        `recording.${isAndroid ? 'm4a' : 'caf'}`
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
}
```

## API

| Method                                                  | Description                                                                                                                                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start(options: AudioRecorderOptions):Promise<boolean>` | Starts recording audio from the device. Permissions are required to record. The plugin attempts to request needed permissions.                                                                  |
| `stop():Promise<boolean>`                               | Stops the recording.                                                                                                                                                                            |
| `pause():Promise<boolean>`                              | Pauses the recording.                                                                                                                                                                           |
| `resume():Promise<boolean>`                             | Resumes the recording.                                                                                                                                                                          |
| `dispose():Promise<boolean>`                            | Disposes of the audio recorder. This will release resources and null out the internal recorder. So it's best to create a new instance of the `AudioRecorder` after if you want to record again. |

## Interfaces

#### AudioRecorderOptions

```typescript
interface AudioRecorderOptions {
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
```

## License

Apache License Version 2.0, January 2004
