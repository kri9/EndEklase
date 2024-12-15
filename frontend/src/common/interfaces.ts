
export interface IdSupplier {
  id: any;
}


export interface InvoiceDTO {
  id: number;
  userId: number;
  userFullName: string;
  dateIssued: Date;
  dueDate: Date;
  amount: number;
  status: string;
}


export interface InvoiceEditDTO extends InvoiceDTO {
  lessons: LessonDTO[]
}

export interface LessonDTO {
  id: number;
  topic: string;
  notes: string;
  date: string;
  groupId: number;
}
