import Container from "../../../../components/container";
import Contribution_card from "./ContributionCard";
import "./styles.scss";
import SubHeading from "../../../../components/subheading";
import { GetMyContributions, GetBrContribution } from "../../../../api/Contribution";
import Loader from "../../../../components/Loader";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CourseCard from "../../../dashboard/components/coursecard";
const Contrisection = () => {
    const user = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);
    const [myContributions, setMyContributions] = useState([]);
    const [brContributions, setBrContributions] = useState([]);
    useEffect(() => {
        const callBack = async () => {
            const resp = await GetMyContributions();
            setMyContributions((prev) => [...resp.data]);
            setIsLoading(false);
        };
        callBack();
    }, []);
    useEffect(() => {
        const callBack = async () => {

            const courses = [
                ...user.user.courses,
                ...user.user.previousCourses
            ];

            const resp = await GetBrContribution(courses);
            setBrContributions((prev) => [...resp.data.unverifiedContributions]);
            setIsLoading(false);
        };
        callBack();
    }, []);

    let ContriCard = [];
    for (const key of myContributions) {
        ContriCard.push(
            key.files.map((file) => (
                <Contribution_card
                    courseCode={key.courseCode}
                    uploadDate={key.updatedAt}
                    isApproved={file.isVerified}
                    content={file.name}
                    key={file._id}
                />
            ))
        );
    }

    return isLoading ? (
        <Container color={"light"}>
            <div className="c_content">
                <div className="sub_head">
                    <SubHeading
                        text={"MY CONTRIBUTIONS"}
                        type={"bold"}
                        color={"black"}
                        algn={"center"}
                    />
                </div>
                <Loader text="Loading your contributions..." />
            </div>
        </Container>
    ) : (
        <Container color={"light"}>
            <div className="c_content">
                <div className="sub_head">
                    <SubHeading
                        text={"MY CONTRIBUTIONS"}
                        type={"bold"}
                        color={"black"}
                        algn={"center"}
                    />
                    {/* {myContributions.length} */}
                </div>
                {!(myContributions.length === 0) ? (
                    ContriCard
                ) : (
                    <div className="No-Contri-graphic" />
                )}
            </div>
        </Container>
    );
};
export default Contrisection;
