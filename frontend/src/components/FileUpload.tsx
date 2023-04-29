import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import './ComponentStyle.css';

type FileUploadProps = {
    onFilesAdded: (files: File[]) => void;
    disabled?: boolean;
    allowedFileTypes?: string[];
};

function FileUpload(props: FileUploadProps) {
    const { onFilesAdded, disabled, allowedFileTypes } = props;

    const handleDrop = useCallback(
        (acceptedFiles: File[]) => {
            const filteredFiles = allowedFileTypes
                ? acceptedFiles.filter((file) =>
                    allowedFileTypes.includes(file.type)
                )
                : acceptedFiles;

            onFilesAdded(filteredFiles);
        },
        [allowedFileTypes, onFilesAdded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        disabled,
    });


    return (
        <div {...getRootProps()} className="file-upload-container">
            <input {...getInputProps()} />
            <p>
                {isDragActive
                    ? `Ziehen Sie die ${allowedFileTypes?.join(" oder ")} Dateien hierhin.`
                    : `Klicken Sie hier oder ziehen Sie ${allowedFileTypes?.join(
                        " oder "
                    )} Dateien hierhin.`}
            </p>
        </div>
    );
}

export default FileUpload;
