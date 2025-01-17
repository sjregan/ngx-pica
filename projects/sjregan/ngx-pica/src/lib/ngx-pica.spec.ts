import {NgxPicaService} from './ngx-pica.service';
import {NgxPicaExifService} from './ngx-pica-exif.service';
import {catchError} from 'rxjs/operators';
import {EMPTY, forkJoin} from 'rxjs';

/* tslint:disable:max-line-length */

describe('ngx-pica tests', () => {
  var originalTimeout;

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
  });

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  const contentType = 'image/png';
  const b64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAX2UlEQVR4nOydeVxO2RvAn/ZFe6KoZE9EiDRISYzIFiMmS5vGFvKzlIYiRQYh+74vgxBCIgzC2LeIok0q7YtK+X3e7juvuu99l5bzlrfn+/HH7dxzzzx3+nbuOeeee440GHQHBKlrJOs7AEQ8QbEQIqBYCBFQLIQIKBZCBBQLIQKKhRABxUKIgGIhRECxECKgWAgRUCyECCgWQgQUCyECioUQAcVCiIBiIURAsRAioFgIEVAshAgoFkIEFAshAoqFEAHFQoiAYiFEQLEQIqBYCBFQLIQIKBZCBBQLIQKKhRABxUKIgGIhRECxECKgWAgRUCyECCgWQgQUCyECioUQAcVCiIBiIURAsRAioFgIEVAshAgoFkIEFAshAoqFEAHFQoiAYiFEQLEQIqBYCBFQLIQIKBZCBBQLIQKKhRBBur4DqG9aGkCzliAhAQV5EPsCysvqOyAxoRGLZdwbpniCQYcfKUUFEBkKJ3dBfm59BiYWSIBB9/qOQeRIy8DkuWA7gflsbhYEzYeYJ6KOSryQAjWd+o5B5Mz0A5sxPM/KKYCFLcTFwKcEkUYlXjS+xrtxbxgwTEAeaRmYvQI0m4soJHGk8Yk1zk2obMqqEHgA3aoxjUwsgw5g1JOe+CAKwg4yNNg1tMBrAyg0EVl04kQja2ONdYV2XaqkPLkLgXPgaTRcOwvGZqDetMpZNU3Qbwf/XBJxmGJAI6ux+gyip5zcyT7IzQJfd0iMo2cwtQCXRSIJTqxoTGJ16s6qgSrzJa3KsEJhHoQshe9cFw4dD936iCJCMaIxiWXOVV09vElPef8K9q5huHZuIGg1pjZDrWlUYtnQU6LCGLJdPMpqb9FQVoXFwaCsRiw4caPRiGVlR2+Yf06Ct8+ZM2/zZxh5b9UeVu5lGYYIQaMRa5QTPeXmRZ6Zy8tYXcW41/T0Fq3AZzPIyhGIT9xoHGIZ9YSWBvTEGxf4XVKQx+okxsfQ09sawR9L6zo+MaRxiGVmRU958wxSEwVcVZgPqz2hpJiebjEUBo+t0/jEkMYhVm8uscKPCXVhRips92dId/RgNbkQ3jQCsTp1p48UfEmrxmD6jQtweg89UVEJvDeChlYdhSiGNAKxuOcy3K7mK5ojIQwiajaHNUdZzXmECXGfQSolxfAaJ/JMtcvZupzlUJtOVRJVNWDhWvCeymqN8ad1R+hmDh2MoYkKqKqDhCTkfIFPCfDsPjyIYmjG/fyI+wzSX2zAc3WVlIR34PlbTYpSVoOAfaCjT09/+RD83KG8nOESg45gZcdq4fEZtf9WCucOwrGtYjbdXtxnN4yaWmVWOwBcOg6vHtWkqJKvcC8SLIaDvEKV9GYt4Pt3ll6VUdWAGcvAdVFFLaXMr1hJKVYrULct3I2oSVQNFbFuY0lKQc/+9MS7V2teYGY6BHsxVE5j3cCoB/tYVh7sXWBjKPQdXI2Sza3BzrHmgTU8xLrG6mMNlnZVUhLfw987alVmWjJkpYPpgCqJEhKs592ze2A2EOYHQW/LmozOd+0Nt69AXk6twmswiLVYv00DvbZVUkL38nw/KDxxMawGeLvOVRJl5cDGHnr0EzDjtLSEVY9KMJ2SkAQlVbh3rbbhNQzEt/HeRBn2RIJU1W6v2xBWfVMnLAmB7r8IlTPhHUScYnUAk+PZKTr6MHAkjHKiG1b2DSZbQPHXuomwXhHf4YYe/ehWxb6oM6sAYKMP/HVUwNcWyR9hZwC8eEBP/5QAhzfB1yKYMKNKupQ0qyKk9QN+TsS38d7Tgp5St0+ZvGw4EMzzbFEBSx3PcQxWcTizFzJS6YkGHesuxPpETMVSVoU+A+mJdftNhM0YmBvI8+zlv1ntubJv/EooK2O11mnwH5v4eRDTR+Gw30FapkrK/esM1UONcfOCIeP4ZRg1laXI9pUCysnLrrOQGhjiKJasHAybSE88tatuCldUgvlBQn1bYWMPmtoQshRys3jmoY21UtWYWCCOj8LeVqCgWCUlKQ7ec00HrQGGJrDqIINVBXnw6B+G/D36wsZQlmG8MLOmp3BPW/05EUexupjSU57dr4NiB44E/z0M0xlyMmHJVFg1j9ldJRVwXwIL14GKOv3UsImg14ae+DG2DkJtAIjjo5C7Y/XhTW3LnDAD7F0Z0uNjYM0CSEtmHf/1P/AJgZatGbL1toRuZhB9DT6+ZakjpwAm5gw1WcpHyEyrbagNA3EUiza5BUDwLGQ+aGjBvNXQyYSeXvYNTu9h/SstYaekf4KFjuC5iuEFJbU60oBhAHwXurlysuZxNjDE8VEoyXVT2Zk1LMrcBtb/zWBVVgYscYLj235YRVFcBKs9Iep8Tf5b2V/gamgN42x4iF2NJcH0Hk6u+q+EW7WHqfPBuDfDqdePWfbk83hbXF7G6gl+SqCPqgtkuz98Lax2nA0VsRPr+3fWP5peTbUhXuhmlows2LvAGGeQlGI4e+4AHNgADAs8VOXULoh5Ah5Cr952fDs8uCFshD8D4ji7wcwK1Kp+9FyYDw9vCXWtlg747WQ9ASW4nqeF+bB2EYQfFzaM9BSICoMmytDWSEDO80fgyCZhi/1JEEex2nSit9919OHOFSjI43eVnAKMnAJzV7KqN24S30OAB+shWC1KillC340AWTnQ1gcZGXqGmKewOwguHqlesT8D4jhtpn0XCDxAT8zJYjV9Ht9myN+8JQx1AOtRPKdSRZ6BvWvga1GtopKQgA5dWU03aimlnEx4fh9SPtaqzAaMOIoFALP86HNHKWJfwIMoiIuB0mLQagG6raGbObTmPaEgPwe2rhCbyXeiREzFkpSEgP30SZ7V4ns5RJ6FIyH83vQhvBFTsaivtVbsZtVJNSD2BWxfWQfj9Y0Y8RULAFQ14a+j9GWxBHJ6D6uiQmqHOPYKORQXwc0LoK0rbL31+A4Ee7MuQWqNWNdYHNoasTp9PS1AsxnD2bQUuHEBos7B5+R6iE1MaRxicdBrA3rtoKUBe2j+cxK8fw1JXEtwI7WmkYmFiApxnN2ANABQLIQIKBZCBBQLIQKKhRABxUKIgGIhRECxECKgWAgRUCyECCgWQgSx+/zrJ+TQev+W2s1S079M8PDilWe9z3zTrkYA0P83F9FGV0NQrPrHzMS4nYHeh6QUPnm6dGzXr9fPNF0AH4UIEVAshAgoFkIEbGP9HMxfuU5dVaW+o6gGKNbPwbOYn2ylv/oUq2eXThZmPdVUlNRVVPIKCvIKCm89eHz73yfVLceqj+kvpiaaair5hUXRj55fjGJaDpQHigryg/ubdzfqqNdCu6m66pfs3PjE5OjHzyPv3C+rzjqz8nKytlb9jDu2b99av5mmemr6l7dxH2/ce3jrgbDLPUhLSbVq+eOLqW9lZcmpaZXKl5OWYrVb8gsFf+kvIy3d17SbmYmxrnYz/ZY6ufkF8QnJ7xMSL9+8m5r+Rfibqg31I5bjaFvfOe5tW+lxnyooLDp85uKy4O2p6RkCy+nVrfORDQHtqpbz6GWMx7LVtx8+5X+ttpam7xz3yfZ2CvIMq2d9yco+GR4ZtG1fXKKAT3eaKCos+mPq7CkOaioMS7RnZufuPHY6cMuenDwBm2Xq6jT/8M+PL88+JKW07j+c82PYruBB/cwAQKJ1Dz6FqKkoe81wmjbBnjEYAAi9fH35xh1PXhH/FlfUH1NoaagfCvYf3N+cf7acvHx3b//j57nW169EX1OTiINbGbUAgMmefx4MZf5CUEJCYsG0Kd4znVWVlfiHUVJS6rNuy5rt+3ll6GrY/u8tQR1aC9jAN+Vz+mh3z/tPXzKejb1+tp0B/W+MJlbEwa0CxbLp1+fwhpVaGlyr6HKxets+7zUh5Yybd9YRIhWre+eOlw9s4dz5qUuRYVdvvoqNe/0+XlFevkvHtiMGWf4+amhTdTUqg7u3/46jpxmLUpCTi7sVpq3VFACu330QsGXP/ScvTLsa+cxyszI3ZT0yCgrbWo5Iy6AvEiknK3tyS9Bwa/aGKEmpnzfuPXrlVvTT129ZxcrL9+pmNMJ6wNSxIzTVVak8+06ec1rgyx2Dlbnp6W1rqbqhoKjo8JnwS1G3kz6nJaemNdPUMNBtYWfd38FuiKKCAgB8LS4eP2vxuasMq6tRYmXn5gXv+bGeUXZu3oa9P34UKNYUe7t9f/lRxxmZ2YfPXjwfeev2wydFX4tlZaS7dzY0MeroPtG+e2dDKs+zmNiRbvP4j8rWBtGJpaej/TT8GNW1if2Q4DjX5/7TF9zZZGVk/Ob9sXi6E/Xj+NmLTzDVW7+Psj203h8ALlz/Z7izByddUlLy+eUTRu3aAMCspas2HzxBu/DoxkAHuyHU8frdh73XhHwtZtiSueKZ4rxg2hTqA8RVW/d6BVVZG81ukMW5ney9dM5H3nRdvPwzl8QAoNxE8U8PtwXTplDy2bnMuX73X1oeSixaFUWDv1hznCYEL11AHR85Gz7jz0BeT16X8aM2LF3QRJHl+su3783HTMkrILI+pejGsdYumUdZlf4lq99YZ0arWE+f0lKvoE3+m3ZSP272W8T4wOK0q/afPFc5vby8/MI19uJ9TbkeCuNsB3GsWrFpp6f/WkarqApj0aoNS/5iy7R4upNBpZa1tLT0joA/qeNrd+7buc5ltAoA8goKFwZu8NuwndUaU1A4tyu4maYGY84a08fEmGPViQtXfp+7hE97bvfxMw7/vZHs3KHt7CkOdRsMBxGJ1blD23HDbKhjB4/FaV8ELGPsu2FH9OPnlBwbli3gziDx3yqjGZn07Wi2HPzb0sHN0sFtX1XnAMD/fzOpg93Hzyxdt1Vg2IFb9oZHsddqmz9tMid95qTftLU0ASAhJdV+OkN49NsJ3h4VzaqolBQVvWY4CcxfLQIWzqIOHr147bzAT2D+85E3OQ0MD6cJMjJEOnAi6hXOd2VveOyzdvO1O7x3WvuPsrIyl0V+LyvWPZ9ibxewec/b+CqL3xUWsXeLHDaw//XoKg+XD0kpjE2HcbY2VCv75v1HrouXCxn5ZM8/B/TpSXVXf9yOG/t2Zi1bnZ3LdwXK/3Be6PsuKkxSUsJ94thl67fl5hcIGQB/enQxtDLvRQ1POHh4FRQJtezggoD1V27dpY5VlZW4/zhrj4hqrNGDrSo6R2krQ3YLecmr2LiL19kjUqMqLq/M+cib1MF8t0m+c92VmygKLHDMr+yN5vxDqrFhU0ZW9qnwyFPhkZdu3KFSenXtrKejDQBPXr0JY2qMMxKfmHIy/GpF/0DO1qqf8AHwZ4Ldr9TBodALsfEJQl6Vm19A3dSp8EgSVomoxurSoZ1aResqPOpOtS68fPMu9Tv4pUdX2qlX7+JCL18bPYTlyrI57h5TJ5wMv3riQsTVf+7xKs28hzE1kBFxK7qmt8LCoje7+Xz97gMzE2PhL/z4Xz3apUM7gMu1iYFDr27sVQtPX2pY61mKQixOvz0hpXo7BlJDAKzqWoWh/e60wFdFqYl1X1ZfSV1Vxc1hjJvDmLSMzF3HQ9fvPpyRRf9DbNWyBQA8fhlT0/tgo6zErh3nuTjOc3GsQQlt9FvWMoYfRemxi3oZ27DWzBHp7IaS0tI6LC0nL3+Q4/Q5fmsSP33mJDZrquE90+XNtVBzrkqurpDlXlW7mshI19nfM6fLLMyLClEi0lc6tf+VcLNx39GN+452NWw/znbQeLsh7Q30AUBDTfXsjvWdB49Nz6z7pWmLS9h/Hpdu3H73IakGJTx+Vdtak0NmTq5KhVvaTTUFvn0SJaIQizOsYqDboloXmhgJu/P2s5jYZzGxf67b6vzbyBC/xQryclqa6isXzJzm5c/JE5eQ1EZfV/gyecG5nftPXi4L3lbL0mrJh6QU6v+qYbvWDUosUTwKn7x6k18xvDvU8hdJ7q25eFOD3tOeE2cXBrIHxCeMGFr51L0nL6gh9QFmPatbbGVu3ntIHTiOtq1NOXXC/SfscebRXB3n+kVEbazQK9crJhQ0XfnfEKVAuht1HNyfeetlTXVVMxNjMxPjltoMa4ruPMbenE1JUcGwrQEnndNv8p7pLHzkMtLSbVvpUf+olEcvY6hxsjb6uhNH/CpkOd06dbh+dMf1ozsu7d8sKcmwRZkE475lgjgWxu5dOo4epqsj3IZQFXBuSlFBvgb/XYGISKz9p8Kog8XTnXp1FWpd/zXe83idGmjeKzp0f3Toftfxo7nPFpf82EOw8vuTk+FXqdlIg/ubO48bKWTk890mvYs6+y7q7M5AH04iZ+R61SIPaSmmTcK48J3rbtnH1LKPaWZ2dnl5lc3Diiv6NM00Bc9K4Obxqzcv3ryjJoRtWCr4HQDF+OFDqJt6F3WW88q/bhGRWJG374dFsscSL+7bRL0P4UOQ1xzrvkx7BVaQmMLuBlJDUzT0W/zYZel5xf90DnP8gqiD3UHLOO+5+TDE4pfAhbOp49m+QZz01Vv3UrPw9FpoRxwS/GrIZ5YrZ4zXK4i+iHx6xQsuBXn56rZBKdy8VlAHY34dGLBglsD8fU27HdkYQB0Hbd9f3TEgIRHdcMN8//XU24+m6mo3ju/u2YVrg90KZGVk1njPpaYD8CL6yfPET6nUL97Wsi/trKsDuxp7G/cxKye38qkTFyJOXIigjgMXzvaZ7cqrzaekqLBklsuprWuoH4P3HH759j3nbPn371P/t4yqeCz7mF45sEVHi+c2BZ6ujss92ZtiTpm/9GPyJ1oGjv1uDgwVsECiHz/3XLGWOvaa4bzRd2GTiok6jIwabBW2a6NkxWP33cfEgM3CvgipLqLbQCAzOycq+uGYX60V5OU01VWnTbRvb6D3HaC0tDQrJ1dWRtrMxNjDacKBdSts+rGaVqXfvm0+cJwa2v6QlMJ5mFIUFBbZVcypGvOrtbS09Ot38QVFRbrazb1nunjPZH8r/IdPwCuuYcPzkbd6dDZs31qfeqROsR8uLSVVWvotPTOrvLxcU03VvEfXGZN+27Pa127QAGp85O+LEW6LV9DKiUtMvnHv4UgbSwV5ubatdKc7jqMmFstIS+fk52tpqPfq1nm649i9Qb7jbG2o5pPzQl/aXVAkpKTOmPQbAPTv3aOkpOThi9ffvtFnRU8eM7yNvi4AUBMlaEQ/fv4xOYWqFM1MujiNG6nTnCX6l+ycr8UlKkpNTLt2HmbVb8sKL09XR2pq5Ke0jGHOHpWHAOsWUc8gbd5U43jIaoH9soys7DHu8yUlJaOO7QSAqOh/rSZMo+U5HLxy4sihvErYfuTUH0tWMp6SkJBY6D7Fa4bgGaQAsGnfsbnL15R/Z95StWObVic2r+5q2IF/IVk5uW6LV5y6FMkrw5KZLpyZF9+/Q/TjZ/GJyb/PXcLJIMwM0sEW5ofW+wszg/RY2OUZPgFZwr0+rxmi/q7wc0ampYOb66LlvOYuFhQWhRw43nHgaIGfIUya57Nu9yHu9NT0jEnzfHhZVfGb+7562z5D69HbDp8s+vqVMU9p6beT4VcHjHf18AviZRUAvIn7aDrC0XtNCK+R2MKir9sOnzS0HsPHKgBYuXn373OXUO02CQkw79H1l57d+ORn5MrNux2tRgVt20drAFTm32evhjt7TPDwImpVPW8gYGvZd6ztoOZNNTu01s/MyY1LSD4XEXX8QgRnLra6qrKpsRE1vvzw+WvGQrp16jDP5feB5r30WmjHxiecuHBl1bZ9+ULPilRSVJg40nZQ3946zZpqaWpkZuckffocFf3vsbDLmbx/PdzIyEhPtR9h08/MsF1rg5Y6yZ/Tnr6OPRcRdez8lWpNLR9pY2lnbaGqrFRSWlq5xurRxVBTTZVVdfF+y145GDtri6ED+uq1aG6g2yKvoDA+MSUuIenE+SuPav2qVEhwZwqECPiJPUIEFAshAoqFEAHFQoiAYiFEQLEQIqBYCBFQLIQIKBZCBBQLIQKKhRABxUKIgGIhRECxECKgWAgRUCyECCgWQgQUCyECioUQAcVCiIBiIURAsRAioFgIEVAshAgoFkIEFAshAoqFEAHFQoiAYiFEQLEQIqBYCBFQLIQIKBZCBBQLIQKKhRABxUKIgGIhRECxECKgWAgRUCyECCgWQgQUCyECioUQAcVCiIBiIURAsRAioFgIEVAshAgoFkIEFAshAoqFEAHFQoiAYiFE+H8AAAD//+N+d6G0b0eDAAAAAElFTkSuQmCC';

  const blob = b64toBlob(b64Data);

  const ngxPica: NgxPicaService = new NgxPicaService(new NgxPicaExifService());

  it('should be resized to 32x32', (done) => {

    const file = new Blob([blob]);

    ngxPica.resizeImage(file, 32, 32)
      .pipe(catchError(err => {
        console.log(err);
        return EMPTY;
      }))
      .subscribe((imageResized: File) => {
        const reader: FileReader = new FileReader();

        reader.addEventListener('load', (event: any) => {
          const img = new Image();

          img.onload = () => {
            expect(img.width).toBe(32);
            expect(img.height).toBe(32);
            done();
          };

          img.src = <string>reader.result;
        });

        reader.readAsDataURL(imageResized);
      });
  });

  it('should be 5 images resized to 32x32', (done) => {
    const files = [];

    for (let i = 0; i < 5; i++) {
      files.push(new Blob([blob]));
    }

    forkJoin([
      ngxPica.resizeImage(files[0], 32, 32),
      ngxPica.resizeImage(files[1], 32, 32),
      ngxPica.resizeImage(files[2], 32, 32),
      ngxPica.resizeImage(files[3], 32, 32),
      ngxPica.resizeImage(files[4], 32, 32),
    ]).subscribe({
      next: (imagesResized: File[]) => {
        imagesResized.forEach((imageResized, index) => {

          expect(imageResized.name).toBe('test' + index);

          const reader: FileReader = new FileReader();

          reader.addEventListener('load', (event: any) => {
            const img = new Image();

            img.onload = () => {
              expect(img.width).toBe(32);
              expect(img.height).toBe(32);
            };

            img.src = <string>reader.result;
          });

          reader.readAsDataURL(imageResized);
        });
      },
      complete: () => done()
    });
  });

  it('should be compress 3MB image to 2MB', (done) => {
    fetch('https://images.unsplash.com/photo-1579393329936-4bc9bc673651?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb')
      .then(res => res.blob())
      .then(blobImg => {

        const file = new Blob([blobImg]);
        console.log(file.size);
        ngxPica.compressImage(file, 2)
          .pipe(catchError(err => {
            console.log(err);
            return EMPTY;
          }))
          .subscribe((imageResized: File) => {
            const reader: FileReader = new FileReader();

            expect(imageResized.size).toBe(2014);
            console.log(imageResized.size);

            reader.addEventListener('load', (event: any) => {
              const img = new Image();

              img.onload = () => {
                expect(img.width).toBe(4096);
                expect(img.height).toBe(2692);
                done();
              };

              img.src = <string>reader.result;
            });

            reader.readAsDataURL(imageResized);
          });
      });
  });

});

export function b64toBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  return new Blob([ab]);
}
