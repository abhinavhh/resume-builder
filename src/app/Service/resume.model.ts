export interface Resume {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;

  languages?: string[];  // send as array of objects

  experiences?: {
    companyName: string;
    position: string;
    experience: {
      startDate: Date;
      endDate?: Date;
    }
  }[];
  
  address: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  profileImage?: File
}
