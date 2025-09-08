import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html',
  styleUrls: ['./resume-form.component.css']
})
export class ResumeFormComponent implements OnInit{

    resumeForm !: FormGroup;
    backendUri: string = 'http://localhost:3000/'
    constructor(private http: HttpClient) {}
    ngOnInit() {
      this.resumeForm = new FormGroup({
        firstName : new FormControl('', [Validators.required, this.nameValidator]),
        lastName: new FormControl('', [Validators.required, this.noLeadingAndEndingSpace]),
        dateOfBirth: new FormControl('', [Validators.required, this.validDOB]),
        email: new FormControl('', [Validators.required, Validators.email]),
        gender: new FormControl('male'),
        languages: new FormGroup({
          english: new FormControl(''),
          hindi: new FormControl(''),
          malayalam: new FormControl('')
        }),
        address: new FormGroup({
          houseNo: new FormControl('', [Validators.required]),
          street: new FormControl('', [Validators.required]),
          city: new FormControl('', [Validators.required]),
          state: new FormControl('', [Validators.required]),
          pincode: new FormControl('', [Validators.required, this.pincodeError]),
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
        console.log(this.resumeForm.value);
        this.http.post(this.backendUri, this.resumeForm.value).subscribe({
          next : (res) => {
            console.log(res);
            alert(res);
          },
          error: (err: any) => {
            alert(err);
            console.log(err);
          }
        });
      }
    }


    // Custom Validation
    nameValidator(control: AbstractControl): any {
      const pattern = /^[a-zA-Z]+$/
      if(control.value.includes(' ') || !pattern.test(control.value)){
        return {nameError: true}
      }
    }

    noLeadingAndEndingSpace(control: AbstractControl): any {
      const pattern = /^[a-zA-Z]$/;
      if(control.value.startsWith(' ') || control.value.endsWith(' ') || control.value.trim('').length === 0 || !pattern.test(control.value)){
        return {spaceError: true}
      } 
    }

    validDOB(control: AbstractControl): any {
      if (!control.value) return null;
      const dob = new Date(control.value);
      const today = new Date();

      if (dob > today) {
        return { futureDate: true };
      }

      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) {
        return { ageError: true };
      }

      return null;
    }


    pincodeError(control: AbstractControl): any {
      const pinPattern = /^[0-9]{6}$/;
      if(!pinPattern.test(control.value as string)) {
        return {pincodeError: true}
      }
      return null;
    }

    getFieldError(field: string): string | null {
      const control  = this.resumeForm.get(field);
      if(!control || !control.touched){
        return null;
      }
      if(control.hasError('required')) return 'This is a required Field';
      if(control.hasError('nameError')) return 'Invalid Input';
      if(control.hasError('spaceError')) return 'Invalid Input';
      if(control.hasError('email')) return 'Please enter a valid email';
      if(control.hasError('pincodeError')) return 'Invalid Pincode';
      if(control.hasError('futureDate')) return 'Future Date Error';
      if(control.hasError('ageError')) return 'Under 18';
      return null;

    }
 
}
