import "./styles.scss";
import Button from "./Buttons";
import date from "date-and-time";
import { verifyFile,unverifyFile } from "../../../../../api/File";

export default function ContributionCard(props) {
    const handleVerify = async () => {
        try {
            console.log("Verifying file:", props.id);
            await verifyFile(props.id);
            toast.success("File verified!");

            // Instead of reload:
        } catch (err) {
            console.error("Error verifying:", err);
            toast.error("Failed to verify file.");
        };
    };

    const handleUnverify = () => {
            try {
                await unverifyFile(props.id, props.onedriveId, currFolderId);
                toast.success("File deleted!");
                const { data } = await getCourse(currCourseCode);
            } catch (err) {
                console.error("Error deleting:", err);
                toast.error("Failed to delete file.");
            } finally {
                setShowDialog(false);
            };
    };

    const now = new Date(props.uploadDate);
    const pattern = date.compile(`DD MMM YYYY   hh:mm A`);
    const finalDate = date.format(now, pattern);
    return (
        <div className="main_card">
            <div className="path">
                <p>{finalDate}</p>
                <p>
                    {props.courseCode}
                </p>
            </div>
            <p className="content"><a className="file-link" href={props.webUrl} target="_blank">{props.content}</a></p>

            <div>
                {
                    props.isBR ? (
                        <div className="br_btn">
                            <div className="btn approve">
                                <Button text="APPROVE"
                                    onClick={handleVerify} />
                            </div>
                            <div className="btn delete">
                                <Button text="DELETE" />
                            </div>
                        </div>
                    ) :
                        (
                            <div className="btn approve">
                                <Button text={props.isApproved === true ? "APPROVED" : "PENDING"} />
                            </div>
                        )
                }
            </div>

        </div>
    );
}
