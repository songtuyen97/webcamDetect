import { Component, Output, EventEmitter } from '@angular/core';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import { HttpService } from 'src/services/http.service';
declare var faceapi: any;
// import {} from 'http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // @Output()
  constructor(
    private http: HttpService
  ) {
    // this.initFaceapi();
  }
  // public pictureTaken = new EventEmitter<WebcamImage>();
  async initFaceapi() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
    let detection = await faceapi.detectSingleFace(document.getElementById('myImg'))
    console.log(detection);
  }
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  webcamImageB64: any;
  
  //custom
  status_completed: boolean = false;
  status_detecting: boolean = false;
  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    // this.toggleDetecting();
    this.autoShot();
  }
  public toggleDetecting() {
    setTimeout(() => {
      this.status_detecting = true;
    }, 1000);
    setTimeout(() => {
      this.status_detecting = false;
      this.status_completed = true;
    }, 3000);
  }
  public autoShot() {
    setTimeout(() => {
      this.triggerSnapshot();
      this.autoShot();
    }, 500);
  }
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    // console.info('received webcam image', webcamImage);
    this.webcamImageB64 = webcamImage.imageAsDataUrl;
    // covert to blob
    var block = this.webcamImageB64.split(";");
    // Get the content type of the image
    var contentType = block[0].split(":")[1];// In this case "image/gif"
    // get the real base64 content of the file
    var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

    // Convert it to a blob to upload
    var blob = this.b64toBlob(realData, contentType);

    // Create a FormData and append the file with "image" as parameter name
    var formDataToUpload = new FormData();
    formDataToUpload.append("userPhoto", blob);
    
    //
    this.initFaceapi();
    // console.log(formDataToUpload);
    //post
    return;
    this.http.post('http://localhost:3000/api/photo', formDataToUpload).subscribe(
      res=>{

      },
      err=> {

      }
    );
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
  b64toBlob(b64Data, contentType, sliceSize = 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
}
