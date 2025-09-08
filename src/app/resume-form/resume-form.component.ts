import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html',
  styleUrls: ['./resume-form.component.css']
})
export class ResumeFormComponent implements OnInit{

    resumeForm !: FormGroup;
    resumeData: any = null;
    backendUri: string = 'http://127.0.0.1:8000/api/resume'
    constructor(private http: HttpClient) {}
    ngOnInit() {
      this.resumeForm = new FormGroup({
        firstName : new FormControl('', [Validators.required, this.alphabetsOnly]),
        lastName: new FormControl('', [Validators.required, this.alphabetsWithSpaces, this.noLeadingOrTrailingSpaces]),
        dateOfBirth: new FormControl('', [Validators.required, this.dob]),
        email: new FormControl('', [Validators.required, Validators.email]),
        gender: new FormControl('male'),
        languages: new FormGroup({
          english: new FormControl(''),
          hindi: new FormControl(''),
          malayalam: new FormControl(''),
          tamil: new FormControl(''),
          others: new FormControl(''),

        }),
        address: new FormGroup({
          houseNo: new FormControl('', [Validators.required]),
          street: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          city: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          state: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          pincode: new FormControl('', [Validators.required, this.pincode]),
        }),
        experiences: new FormArray([])
          
      })
    }

    get experience(): FormArray {
      return this.resumeForm.get('experiences') as FormArray;
    }

    addExperience() {
      const expGroup = new FormGroup({
        companyName: new FormControl('', Validators.required),
        position: new FormControl('', Validators.required),
        experience: new FormGroup({
          startDate: new FormControl('', Validators.required),
          endDate: new FormControl('')
        })
        
      });

      this.experience.push(expGroup);
    }
    handleDelete(index: number) {
      this.experience.removeAt(index);
    }

    handleSubmit() {
      if(this.resumeForm.valid) {
        const formValue = this.resumeForm.value;

        const selectedLanguages = Object.keys(formValue.languages)
          .filter(langKey => formValue.languages[langKey])
          .map(langKey => ({
            name: langKey.charAt(0).toUpperCase() + langKey.slice(1)
          }))
        const payload = {
          ...formValue,
          languages: selectedLanguages
        };

        this.http.post<{ message: string , resumeId: string}>(this.backendUri + '/submit/', payload).subscribe({
          next : (res) => {
            alert(res.message);
            console.log(res.resumeId);
            localStorage.setItem('id', res.resumeId);
            this.resumeForm.reset({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              email: '',
              gender: '',
              languages: {
                english: false,
                hindi: false,
                malayalam: false
              },
              address: {
                houseNo: '',
                street: '',
                city: '',
                state: '',
                pincode: ''
              },
              experiences: []
            });
          },
          error: (err: any) => {
          
            alert(err.error)
          }
        });
      }
    }

    fetchResumeDetails() {
      this.http.get<{resumes: any}>(this.backendUri + '/get-resume', {
        params: {id: localStorage.getItem('id') || ''}
      }).subscribe({
        next : (data) => {
          this.resumeData = data.resumes;
          console.log(this.resumeData);
        }
      })
    }


    // number input 

    allowOnlyNumbers(event: KeyboardEvent) {
      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
      if(allowedKeys.includes(event.key)) {
        return;
      }

      if(!/^\d$/.test(event.key)) {
        event.preventDefault();
      }
    }

    // Custom Validation
    alphabetsOnly(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const pattern = /^[A-Za-z]+$/;
      return pattern.test(control.value) ? null : { alphabetsOnly: true };
    }

    alphabetsWithSpaces(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const value = control.value as string;
      const pattern = /^[A-Za-z ]+$/;
      if (!pattern.test(value)) return { invalidChars: true };
      if (value.trim() !== value) return { spaceError: true };
      if (/\s{2,}/.test(value)) return { consecutiveSpaces: true };
      return null;
    }

    noLeadingOrTrailingSpaces(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const value = control.value as string;
      if (value.trim() !== value) return { spaceError: true };
      return null;
    }


    pincode(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const pattern = /^[0-9]{6}$/;
      return pattern.test(control.value) ? null : { pincodeError: true };
    }

    dob(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const dob = new Date(control.value);
      const today = new Date();
      if (dob > today) return { futureDate: true };
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) return { ageError: true };
      return null;
    }

    notFutureDate(control: AbstractControl): ValidationErrors | null {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      const today = new Date();
      if (inputDate > today) return { futureDate: true };
      return null;
    }

    getFieldError(field: string): string | null {
      const control  = this.resumeForm.get(field);
      if(!control || !control.touched){
        return null;
      }
      if (control.hasError('required')) return 'This field is required';
      if (control.hasError('alphabetsOnly')) return 'Only alphabets are allowed';
      if (control.hasError('invalidChars')) return 'Only alphabets and spaces are allowed';
      if (control.hasError('spaceError')) return 'No leading or trailing spaces allowed';
      if (control.hasError('consecutiveSpaces')) return 'Multiple spaces are not allowed';
      if (control.hasError('email')) return 'Please enter a valid email address';
      if (control.hasError('pincodeError')) return 'Pincode must be 6 digits';
      if (control.hasError('futureDate')) return 'Date cannot be in the future';
      if (control.hasError('ageError')) return 'You must be at least 18 years old';

      return null;

    }
 
}
