import File from "../file/";
import FileDisplay from "../../../file-display";
import { useSelector } from "react-redux";

const FileController = ({ files, code, isMobileView = false }) => {
    const user = useSelector((state) => state.user.user);

    if (!files) return null;

    // Filter files: BR sees everything, others see only verified
    const visibleFiles = files.filter((file) => {
        if (user?.isBR) return true;
        return file.isVerified;
    });

    // console.log("Received files in FileController:", files);
    // console.log("Visible files after filtering:", visibleFiles);

    return visibleFiles.map((file) => (
        <FileDisplay file={file} key={file._id} code={code} isMobileView={isMobileView} />
    ));
};

export default FileController;
