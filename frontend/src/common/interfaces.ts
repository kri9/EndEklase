export interface IdSupplier {
  id: any;
}

export interface FullInvoiceDTO extends IdSupplier {
  id: number;
  userId: number;
  userFullName: string;
  dateIssued: Date;
  dueDate: Date;
  paymentReceiveDate?: Date | string | null;
  amount: number;
  status: string;
  attendances?: number[];
}

export type InvoiceState = FullInvoiceDTO & {
  attendancesMeta: (AttendanceDTO | undefined)[];
};

export interface AttendanceDTO {
  id: number;
  childId: number;
  lessonId: number;
  attended: boolean;
  lesson: LessonDTO;
  date: string;
}

export interface LessonDTO {
  id: number;
  topic: string;
  notes: string;
  date: string;
  groupId: number;
  groupName: string;
  kindergartenName: string;
  isLockedForEditing: boolean;
  numOfAttendees: number;
}
