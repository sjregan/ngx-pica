import {Injectable} from '@angular/core';
import {Subject, Observable, Subscription} from 'rxjs';
import {NgxPicaErrorInterface, NgxPicaErrorType} from './ngx-pica-error.interface';
import {
  ExifOptions,
  NgxPicaCompressOptionsInterface,
  NgxPicaResizeOptionsInterface
} from './ngx-pica-resize-options.interface';
import {NgxPicaExifService} from './ngx-pica-exif.service';
import Pica from 'pica';
import {switchMap} from 'rxjs/operators';


declare let window: any;

@Injectable()
export class NgxPicaService {
  private readonly picaResizer = new Pica();
  private MAX_STEPS = 20;

  constructor(private _ngxPicaExifService: NgxPicaExifService) {
    if (!this.picaResizer || !this.picaResizer.resize) {
      this.picaResizer = new window.Pica();
    }
  }

  public resizeImages(blobs: Blob[], width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<Blob> {
    const resizedImage: Subject<Blob> = new Subject();
    const totalBlobs: number = blobs.length;

    if (totalBlobs > 0) {
      const nextBlob: Subject<Blob> = new Subject();
      let index = 0;

      const subscription: Subscription = nextBlob
        .pipe(
          switchMap((blob: Blob) => this.resizeImage(blob, width, height, options))
        )
        .subscribe(imageResized => {
          index++;
          resizedImage.next(imageResized);

          if (index < totalBlobs) {
            nextBlob.next(blobs[index]);

          } else {
            resizedImage.complete();
            subscription.unsubscribe();
          }
        }, (err) => {
          const ngxPicaError: NgxPicaErrorInterface = {
            blob: blobs[index],
            err: err
          };

          resizedImage.error(ngxPicaError);
        });

      nextBlob.next(blobs[index]);
    } else {
      const ngxPicaError: NgxPicaErrorInterface = {
        err: NgxPicaErrorType.NO_BLOBS_RECEIVED
      };

      resizedImage.error(ngxPicaError);
      resizedImage.complete();
    }

    return resizedImage.asObservable();
  }

  public resizeImage(blob: Blob, width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<Blob> {
    const resizedImage: Subject<Blob> = new Subject();
    const originCanvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx = originCanvas.getContext('2d');
    const img = new Image();
    const urlCreator = window.URL || window.webkitURL;

    if (!options) {
      options = {
        exifOptions: {
          forceExifOrientation: true
        }
      };
    }

    if (ctx) {
      const imageUrl = urlCreator.createObjectURL(blob);

      img.onerror = (err) => {
        urlCreator.revokeObjectURL(imageUrl);
        resizedImage.error({err: NgxPicaErrorType.READ_ERROR, blob: blob, original_error: err});
      };

      img.onload = () => {
        this.processImageExifOptions(img, options.exifOptions)
          .then(orientedImage => {
            originCanvas.width = orientedImage.width;
            originCanvas.height = orientedImage.height;

            ctx.drawImage(orientedImage, 0, 0);

            const imageData = ctx.getImageData(0, 0, orientedImage.width, orientedImage.height);
            if (options && options.aspectRatio && options.aspectRatio.keepAspectRatio) {
              let ratio: number;

              if (options.aspectRatio.forceMinDimensions) {
                ratio = Math.max(width / imageData.width, height / imageData.height);
              } else {
                ratio = Math.min(width / imageData.width, height / imageData.height);
              }

              width = Math.round(imageData.width * ratio);
              height = Math.round(imageData.height * ratio);
            }

            const destinationCanvas: HTMLCanvasElement = document.createElement('canvas');
            destinationCanvas.width = width;
            destinationCanvas.height = height;

            this.picaResize(blob, originCanvas, destinationCanvas, options)
              .catch((err) => resizedImage.error(err))
              .then((imgResized: Blob) => {
                resizedImage.next(imgResized);
                resizedImage.complete();
              }).finally(() => {
                urlCreator.revokeObjectURL(imageUrl);
              });
          })
          .catch((err) => {
            urlCreator.revokeObjectURL(imageUrl);
            resizedImage.error({err: NgxPicaErrorType.READ_ERROR, blob: blob, original_error: err});
          });
      };

      img.src = imageUrl;
    } else {
      resizedImage.error(NgxPicaErrorType.CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED);
    }

    return resizedImage.asObservable();
  }

  public compressImages(blobs: Blob[], sizeInMB: number, options?: NgxPicaCompressOptionsInterface): Observable<Blob> {
    const compressedImage: Subject<Blob> = new Subject();
    const totalBlobs: number = blobs.length;

    if (totalBlobs > 0) {
      const nextBlob: Subject<Blob> = new Subject();
      let index = 0;

      const subscription: Subscription = nextBlob
        .pipe(
          switchMap((blob: Blob) => this.compressImage(blob, sizeInMB, options))
        )
        .subscribe(imageCompressed => {
          index++;
          compressedImage.next(imageCompressed);

          if (index < totalBlobs) {
            nextBlob.next(blobs[index]);

          } else {
            compressedImage.complete();
            subscription.unsubscribe();
          }
        }, (err) => {
          const ngxPicaError: NgxPicaErrorInterface = {
            blob: blobs[index],
            err: err
          };

          compressedImage.error(ngxPicaError);
        });

      nextBlob.next(blobs[index]);
    } else {
      const ngxPicaError: NgxPicaErrorInterface = {
        err: NgxPicaErrorType.NO_BLOBS_RECEIVED
      };

      compressedImage.error(ngxPicaError);
      compressedImage.complete();
    }

    return compressedImage.asObservable();
  }

  public compressImage(blob: Blob, sizeInMB: number, options?: NgxPicaCompressOptionsInterface): Observable<Blob> {
    const compressedImage: Subject<Blob> = new Subject();

    if (this.bytesToMB(blob.size) <= sizeInMB) {
      setTimeout(() => {
        compressedImage.next(blob);
        compressedImage.complete();
      });
    } else {

      const originCanvas: HTMLCanvasElement = document.createElement('canvas');
      const ctx = originCanvas.getContext('2d');
      const img = new Image();
      const reader: FileReader = new FileReader();

      if (!options) {
        options = {
          exifOptions: {
            forceExifOrientation: true
          }
        };
      }

      if (ctx) {
        reader.addEventListener('load', () => {
          img.onload = () => {
            this.processImageExifOptions(img, options.exifOptions)
              .then(orientedImage => {
                originCanvas.width = orientedImage.width;
                originCanvas.height = orientedImage.height;

                ctx.drawImage(orientedImage, 0, 0);

                this.getCompressedImage(originCanvas, blob.type, 1, sizeInMB, 0)
                  .catch((err) => compressedImage.error(err))
                  .then((compressedImageBlob: Blob) => {
                    compressedImage.next(compressedImageBlob);
                    compressedImage.complete();
                  });
              });
          };

          img.src = <string>reader.result;
        });

        reader.readAsBinaryString(blob);
      } else {
        compressedImage.error(NgxPicaErrorType.CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED);
      }
    }

    return compressedImage.asObservable();
  }

  private processImageExifOptions(img: HTMLImageElement, exifOptions: ExifOptions): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      if (exifOptions.forceExifOrientation) {
        this._ngxPicaExifService.getExifOrientedImage(img)
          .then(orientedImage => resolve(orientedImage))
          .catch(err => reject(err));
      } else {
        resolve(img);
      }
    });
  }

  private getCompressedImage(canvas: HTMLCanvasElement, type: string, quality: number, sizeInMB: number, step: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      this.picaResizer.toBlob(canvas, type, quality)
        .catch((err) => reject(err))
        .then((blob: Blob) => {
          this.checkCompressedImageSize(canvas, blob, quality, sizeInMB, step)
            .catch((err) => reject(err))
            .then((compressedBlob: Blob) => {
                resolve(compressedBlob);
              }
            );
        });
    });
  }

  private checkCompressedImageSize(
    canvas: HTMLCanvasElement,
    blob: Blob,
    quality: number,
    sizeInMB: number,
    step: number
  ): Promise<Blob> {
    return new Promise<Blob>((resolve,
                              reject) => {
      if (step > this.MAX_STEPS) {
        reject(NgxPicaErrorType.NOT_BE_ABLE_TO_COMPRESS_ENOUGH);
      } else if (this.bytesToMB(blob.size) < sizeInMB) {
        resolve(blob);
      } else {
        const newQuality: number = quality - (quality * 0.1);
        const newStep: number = step + 1;

        // recursively compression
        resolve(this.getCompressedImage(canvas, blob.type, newQuality, sizeInMB, newStep));
      }
    });
  }

  private picaResize(blob: Blob, from: HTMLCanvasElement, to: HTMLCanvasElement, options: any): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      this.picaResizer.resize(from, to, options)
        .catch((err) => reject(err))
        .then((resizedCanvas: HTMLCanvasElement) => this.picaResizer.toBlob(resizedCanvas, blob.type))
        .then((resizedBlob: Blob) => {
          resolve(resizedBlob);
        });
    });
  }

  private bytesToMB(bytes: number) {
    return bytes / 1048576;
  }
}
