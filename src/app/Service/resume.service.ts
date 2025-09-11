import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Resume } from "./resume.model";

@Injectable({
    providedIn: 'root'
})
export class ResumeService {

    backendUrl: string = "http://127.0.0.1:8000/api/resume/"

    constructor(private http: HttpClient) {}


    getAllResumes(): Observable<any> {
        return this.http.get(this.backendUrl + 'get-resume/');
    }
    getResumeById(id: any): Observable<any> {
        return this.http.get<{'resumes': Resume}>(this.backendUrl + 'get-resume/', {
            params : {id: id}
        })
    }

    createResume(resume: Resume, file: File): Observable<{ message: string , resumeId: string}> {
        const formData = new FormData();
        
        formData.append("firstName", resume.firstName);
        formData.append("lastName", resume.lastName);
        formData.append("email", resume.email);
        formData.append("dateOfBirth", resume.dateOfBirth.toString());
        formData.append("gender", resume.gender);

        formData.append("houseNo", resume.address.houseNo);
        formData.append("street", resume.address.street);
        formData.append("city", resume.address.city);
        formData.append("state", resume.address.state);
        formData.append("pincode", resume.address.pincode);
        formData.append("experiences", JSON.stringify(resume.experiences));
        formData.append("languages", JSON.stringify(resume.languages));

        if (file) {
            formData.append("profileImage", file, file.name);
        }

        return this.http.post<{ message: string , resumeId: string}>(this.backendUrl + 'submit/', formData);
    }

    deleteResumeById(id: string): Observable<any> {
        return this.http.delete(this.backendUrl + 'delete/', {
            params: { id }
        });
    }

    updateResume(id: string, file:File, resume: Resume): Observable<any> {

        const formData = new FormData();
        formData.append("id", id);
        formData.append("firstName", resume.firstName);
        formData.append("lastName", resume.lastName);
        formData.append("email", resume.email);
        formData.append("dateOfBirth", resume.dateOfBirth.toString());
        formData.append("gender", resume.gender);

        formData.append("houseNo", resume.address.houseNo);
        formData.append("street", resume.address.street);
        formData.append("city", resume.address.city);
        formData.append("state", resume.address.state);
        formData.append("pincode", resume.address.pincode);
        formData.append("experiences", JSON.stringify(resume.experiences));
        formData.append("languages", JSON.stringify(resume.languages));
        if (file) {
            formData.append("profileImage", file, file.name);
        }
        return this.http.post(this.backendUrl + 'submit/', formData)
    }
}