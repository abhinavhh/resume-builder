import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Resume } from '../Service/resume.model';
import { ResumeService } from '../Service/resume.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html',
  styleUrls: ['./resume-form.component.css']
})
export class ResumeFormComponent implements OnInit{

    resumeForm !: FormGroup;
    resumeData!: Resume;
    showResume: boolean = false;
    isEditMode: boolean = false;
    editResumeId: string | null = null;
    selectedFile!: File;
    Validators = Validators;
    
    constructor(private resumeService: ResumeService) {}
    ngOnInit() {
      this.resumeForm = new FormGroup({
        firstName : new FormControl('', [Validators.required, this.alphabetsOnly]),
        lastName: new FormControl('', [Validators.required, this.alphabetsWithSpaces, this.noLeadingOrTrailingSpaces]),
        dateOfBirth: new FormControl('', [Validators.required, this.dob, this.notFutureDate]),
        email: new FormControl('', [Validators.required, Validators.email]),
        gender: new FormControl('male'),
        languages: new FormGroup({
          english: new FormControl(false),
          hindi: new FormControl(false),
          malayalam: new FormControl(false),
          tamil: new FormControl(false),
          others: new FormControl(false),

        }, [Validators.required, this.atLeastOneLanguageValidator]),
        address: new FormGroup({
          houseNo: new FormControl('', [Validators.required]),
          street: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          city: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          state: new FormControl('', [Validators.required, this.noLeadingOrTrailingSpaces]),
          pincode: new FormControl('', [Validators.required, this.pincode, Validators.pattern(/^\d{6}$/)]),
        }),
        experiences: new FormArray([])
      })

      const editId = localStorage.getItem('editResumeId');
      if(editId) {
        this.loadResumeForEdit(editId);
        localStorage.removeItem('editResumeId');
      }
    }

    get experience(): FormArray {
      return this.resumeForm.get('experiences') as FormArray;
    }

    addExperience(exp?: any) {
      const expGroup = new FormGroup({
        companyName: new FormControl(exp?.companyName || '', Validators.required),
        position: new FormControl(exp?.position || '', Validators.required),
        experience: new FormGroup({
          startDate: new FormControl(exp?.experience.startDate || '', [Validators.required, this.notFutureDate]),
          endDate: new FormControl(exp?.experience.endDate || '',[Validators.required, this.noInvalidDate])
        }, this.invalidDates)
        
      });

      this.experience.push(expGroup);
    }
    handleDelete(index: number) {
      this.experience.removeAt(index);
    }

    handleSubmit() {
      if(this.resumeForm.valid) {
        const formValue = this.resumeForm.value;
        console.log(formValue);
        const selectedLanguages = Object.entries(formValue.languages)
          .filter(([_, selected]) => selected === true)
          .map(([lang]) => lang);

        const payload: Resume = {
          ...formValue,
          languages: selectedLanguages
        };

        if(this.isEditMode && this.editResumeId) {
          this.resumeService.updateResume(this.editResumeId, this.selectedFile, payload).subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: res.message
              })
              // alert(res.message);
              this.isEditMode = false;
              this.editResumeId = null;
              this.fetchResumeDetails();
              this.resumeForm.reset({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                email: '',
                gender: 'male',
                languages: {
                  english: false,
                  hindi: false,
                  malayalam: false,
                  other: false,
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
            error: (err) => {
              alert(err.message || err.response?.error.message || 'Something happened check console');
            }
          })
        }

        else{
          this.resumeService.createResume(payload, this.selectedFile).subscribe({
            next : (res: any) => {
              this.resumeData = res.resume;
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: res.message
              })
              this.fetchResumeDetails();
              this.resumeForm.reset({
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                email: '',
                gender: 'male',
                languages: {
                  english: false,
                  hindi: false,
                  malayalam: false,
                  other: false,
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
              alert(err.message || 'Something Happened Try Again');
            }
          })
        }
      }else {
        this.resumeForm.markAllAsTouched();
      }
    }


    // edit resume
    loadResumeForEdit(id: string) {
      this.resumeService.getResumeById(id).subscribe({
        next: (res: any) => {
          const resume = res.resumes;
          this.isEditMode = true;
          this.editResumeId = id;
          this.showResume = false;
          console.log(resume.languages);

          this.resumeForm.patchValue({
            firstName: resume.firstName,
            lastName: resume.lastName,
            dateOfBirth: resume.dateOfBirth,
            email: resume.email,
            gender: resume.gender,
            address: {
              houseNo: resume.address.houseNo,
              street: resume.address.street,
              city: resume.address.city,
              state: resume.address.state,
              pincode: resume.address.pincode
            },
            languages: {
              english: resume.languages?.includes('english'),
              hindi: resume.languages?.includes('hindi'),
              malayalam: resume.languages?.includes('malayalam'),
              tamil: resume.languages?.includes('tamil'),
              others: resume.languages?.includes('others'),
            }
          });

          // Reset experiences FormArray before filling
          this.experience.clear();
          if (resume.experiences) {
            resume.experiences.forEach((exp: any) => {
              this.addExperience(exp);
              // const expGroup = new FormGroup({
              //   companyName: new FormControl(exp.companyName, Validators.required),
              //   position: new FormControl(exp.position, Validators.required),
              //   experience: new FormGroup({
              //     startDate: new FormControl(exp.experience?.startDate),
              //     endDate: new FormControl(exp.experience?.endDate)
              //   })
              // });
              // this.experience.push(expGroup);
            });
          }
        },
        error: (err) => {
          alert(err.message || 'Error loading resume for edit');
        }
      });
    }


    fetchResumeDetails() {
      this.showResume = true;
      let id = localStorage.getItem('id');
      if(!id){
        return
      }
      this.resumeService.getResumeById(id).subscribe({
        next: (res) => {
          this.resumeData = res.resumes;
        },
        error: (err) => {
          console.log(err);
        }
      })
    }

    showForm() {
      this.showResume = false;
      
    }
    handleShowResume() {
      if(this.isEditMode || this.resumeForm.dirty) {
        Swal.fire({
          title: "Are you sure?",
          text: "You have unsaved changes. Do you want to remove it.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!"
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Cleared!",
              text: "Your form data has been cleared.",
              icon: "success"
            });
            this.resumeForm.reset({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              email: '',
              gender: 'male',
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
            this.isEditMode = false;
            this.showResume = true;
          }
          else{
            return
          }
        });
      }
      else {
        this.showResume = true;
      }
      
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

    atLeastOneLanguageValidator(control: AbstractControl): ValidationErrors | null {
      const group = control as FormGroup;
      const hasAtLeastOne = Object.values(group.controls).some(ctrl => ctrl.value === true);
      return hasAtLeastOne ? null : { atLeastOneRequired: true };
    }


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

    noInvalidDate(control: AbstractControl): ValidationErrors | null {
      if(!control.value) return null;
      const inputDate = control.value.toString();
      const year = inputDate.split('-')[0];
      if (!/^\d{4}$/.test(year)) {
        return { invalidYear: true };
      }
      return null;
    }

    invalidDates(control: AbstractControl): ValidationErrors | null {
      if(!control.value) return null;
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;
      if(startDate > endDate) {
        return { dateMissMatch: true };
      }
      return null;
    }
    // Image Section

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0];
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
      if (control.hasError('pattern')) return 'Invalid Numbers';
      if (control.hasError('invalidYear')) return 'Invalid Year';
      if (control.hasError('dateMissMatch')) return 'Date Miss Match';

      return null;

    }
 
}
