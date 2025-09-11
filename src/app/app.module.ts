import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ResumeFormComponent } from './resume-form/resume-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResumeService } from './Service/resume.service';
import { AllResumeComponent } from './all-resume/all-resume.component';

@NgModule({
  declarations: [
    AppComponent,
    ResumeFormComponent,
    AllResumeComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [ResumeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
