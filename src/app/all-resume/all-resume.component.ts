import { Component, OnInit } from '@angular/core';
import { ResumeService } from '../Service/resume.service';
import { Resume } from '../Service/resume.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-resume',
  templateUrl: './all-resume.component.html',
  styleUrls: ['./all-resume.component.css']
})
export class AllResumeComponent implements OnInit {
  resumeData!: Resume | null;
  allResumesData: Resume[] = [];
  viewAll: boolean = false;

  constructor(private resumeService: ResumeService) {}

  ngOnInit() {
    this.loadResumes();
  }

  loadResumes() {
    this.resumeService.getAllResumes().subscribe({
      next: (res) => {
        this.allResumesData = res.resumes;
      },
      error: (err) => {
        alert(err.error.error);
      }
    });
  }

  fetchResumeDetails(id: string | undefined) {
    this.resumeService.getResumeById(id).subscribe({
      next: (res) => {
        const data = res.resumes;
        console.log(data);

        if (data.languages && typeof data.languages === 'string') {
          try {
            data.languages = JSON.parse(data.languages);
          } catch (e) {
            data.languages = [];
          }
        }
        
        this.resumeData = data;
        this.viewAll = true;
      }
    });
  }

  deleteResume(id: string | undefined, event: Event) {
    event.stopPropagation(); 
    if (!id) {
      alert('Invalid resume id');
      return;
    }
    this.resumeService.deleteResumeById(id).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: res.message
        })
        this.allResumesData = this.allResumesData.filter(r => r.id !== id); 
        if(this.allResumesData.length === 0) {
          this.resumeData = null;
        }
      },
      error: (err) => {
        alert(err.error.error || 'Something Happened Check Console');
        console.log(err);
      }
    });
  }

  updateResume(id: string | undefined, event: Event) {
    event.stopPropagation(); 
    if (!id) {
      alert('Invalid resume id');
      return;
    }
    localStorage.setItem('editResumeId', id);
    window.location.reload();
  }

  handleViewAllClick(){
    this.loadResumes();
    this.resumeData = null;
    this.viewAll = false;
    
  }
}
