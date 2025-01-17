# @sjregan/ngx-pica
> @sjregan/ngx-pica is an Angular (LTS) module to resize images files in browser using <a href="https://github.com/nodeca/pica">pica - high quality image resize in browser</a>.

[![latest](https://img.shields.io/npm/v/%40sjregan/ngx-pica/latest.svg)](https://www.npmjs.com/package/@sjregan/ngx-pica) 

## Important

This is a fork of [@digitalascetic/ngx-pica](https://github.com/digitalascetic/ngx-pica) with a crucial difference: all uses of `File`
have been replaced with `Blob`, and `FileReader` is no longer used.

This allows the library to be used in projects that also use `cordova-plugin-file`, or use libraries that depend on
`cordova-plugin-file`, or to be used within Angular projects with `zone.js`.

**Angular v5**

@sjregan/ngx-pica Angular 5 compatibility is under version **1.1.8**  
```bash
$ npm install @sjregan/ngx-pica@1.1.8 --save
```

## Install
1. Add `ngx-pica` module as dependency to your project.
```bash
$ npm install pica exifr @sjregan/ngx-pica --save
```
2. Include `NgxPicaModule` into your main AppModule or in module where you will use it.
```
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxPicaModule } from '@sjregan/ngx-pica';

@NgModule({
  imports: [
    BrowserModule,
    NgxPicaModule
  ],
  declarations: [ AppComponent ],
  exports: [ AppComponent ]
})
export class AppModule {}
```



## Services
* **NgxPicaService** - Manipulate images using <a href="https://github.com/nodeca/pica">pica - high quality image resize in browser</a>
* **NgxPicaImageService** - Supplementary services to help you work with images

## NgxPicaService Methods
#### `.resizeImages(files: Blob[], width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<Blob>`
This method resize an array of images doing it sequentially to optimize CPU and memory use.
* **files:[]** - Array of images to resize
* **width** - Width to be resized (px)
* **height** - Height to be resized (px)
* **options** - Based on <a href="https://github.com/nodeca/pica#resizefrom-to-options---promise">pica - resize options</a>, we've also added exif and aspect ratio options:
    * **exifOptions**:    
        * **forceExifOrientation** - [default: true] Set false to avoid image orientation from Exif info.
    * **aspectRatio**:     
        * **keepAspectRatio** - Set true to ensure the aspect ratio of the image is maintained as it get resized
        * **forceMinDimensions** - Set true to ensure the dimensions of image resized will be greater than width and height values defined

The Observable receives a next on every file that has been resized.
If something goes wrong the Observable receive an error.

All errors are wrapped by NgxPicaErrorInterface.

### `.resizeImage(file: Blob, width: number, height: number, options?: NgxPicaResizeOptionsInterface): Observable<Blob>`
Same as above but only takes one file instead of an array of files.

### `.compressImages(files: Blob[], sizeInMB: number, options?: NgxPicaCompressOptionsInterface): Observable<Blob>`
This method compress an array of images doing it sequentially to optimize CPU and memory use.
* **files:[]** - Array of images to resize
* **sizeInMB** - File size in MegaBytes
* **options** - Same as resize options, but only for exif orientation:
    * **exifOptions**:    
        * **forceExifOrientation** - [default: true] Set false to avoid image orientation from Exif info.

The Observable receives a next on every file that has been resized.
If something goes wrong the Observable receive an error.

All errors are wrapped by NgxPicaErrorInterface.

### `.compressImage(file: Blob, sizeInMB: number, options?: NgxPicaCompressOptionsInterface): Observable<Blob>`
Same as above but only takes one file instead of an array of files.

## NgxPicaImageService Methods
#### `.isImage(file: Blob): boolean`
This method check if a file is an image or not

## Data Structures
```
export interface ExifOptions {
  forceExifOrientation: boolean;
}
```

```
export interface AspectRatioOptions {
    keepAspectRatio: boolean;
    forceDimensions?: boolean;
}
```

```
export interface NgxPicaResizeOptionsInterface {
    exifOptions: ExifOptions;
    aspectRatio?: AspectRatioOptions;
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
}
```

```
export interface NgxPicaCompressOptionsInterface {
  exifOptions: ExifOptions;
}
```

```
export enum NgxPicaErrorType {
    NO_FILES_RECEIVED = 'NO_FILES_RECEIVED',
    CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED = 'CANVAS_CONTEXT_IDENTIFIER_NOT_SUPPORTED',
    NOT_BE_ABLE_TO_COMPRESS_ENOUGH = 'NOT_BE_ABLE_TO_COMPRESS_ENOUGH'
}

export interface NgxPicaErrorInterface {
    err: NgxPicaErrorType;
    file?: Blob;
}
```

## Outdated Example

This example demonstrates use with `File` and has not been updated to use with `Blob`.


```ts
import { Component, EventEmitter } from '@angular/core';
import { NgxPicaService } from '@sjregan/ngx-pica';

@Component({
  selector: 'app-home',
  template: `
      <img *ngFor="let image of images" [src]="image" />
  
      <input type="file" [attr.accept]="image/*" multiple
             (change)="handleFiles($event)">
  `
})
export class AppHomeComponent {
    images: File[] = [];
    
    constructor(private _ngxPicaService: NgxPicaService) {
    
    }
    
    public handleFiles(event: any) {
        const files: File[] = event.target.files;
        
        this._ngxPicaService.resizeImages(files, 1200, 880)
            .subscribe((imageResized: File) => {
                let reader: FileReader = new FileReader();
                
                reader.addEventListener('load', (event: any) => {
                    this.images.push(event.target.result);
                }, false);
                
                reader.readAsDataURL(imageResized);
                
            }, (err: NgxPicaErrorInterface) => {
                throw err.err;
            });
    }
```  
