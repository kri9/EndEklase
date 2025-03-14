import { useState } from 'react';
import { filePostRequest } from 'src/api'

export interface FileUploadButtonProps {
  buttonTitle: string;
  uploadUrl: string;
  acceptedFileExtension: string;
}

export function FileUploadButton(props: FileUploadButtonProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      handleSubmit(event.target.files[0]); // Automatically submit on file selection
    }
  };

  const handleSubmit = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await filePostRequest(props.uploadUrl, formData);
      alert("Uploaded file");
    } catch (error) {
      alert('Error uploading file:' + error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-xl font-bold">Upload XLSX File</h1>
      <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {props.buttonTitle}
      </label>
      <input id="file-upload" type="file" accept={props.acceptedFileExtension} onChange={handleFileChange} className="hidden" />
    </div>
  );
}
