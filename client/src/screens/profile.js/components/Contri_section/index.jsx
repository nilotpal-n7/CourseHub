import Container from "../../../../components/container";
import Contribution_card from "./ContributionCard";
import "./styles.scss";
import SubHeading from "../../../../components/subheading";
import { GetMyContributions } from "../../../../api/Contribution";

import { useEffect, useState } from "react";
import CourseCard from "../../../dashboard/components/coursecard";
const Contrisection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [myContributions, setMyContributions] = useState([]);
    useEffect(() => {
        const callBack = async () => {
            const resp = await GetMyContributions();
            setMyContributions((prev) => [...resp.data]);
            setIsLoading(false);
        };
        callBack();
    }, []);
    let ContriCard = [];
    for(const key of myContributions) {
        ContriCard.push(key.files.map((file) => (
            <Contribution_card
                courseCode={key.courseCode}
                uploadDate={key.updatedAt}
                isApproved={file.isVerified}
                content={file.name}
                key={file._id}
            />
        )))
    }

    return isLoading ? (
        "loading"
    ) : (
        <Container color={"light"}>
            <div className="c_content">
                <div className="sub_head">
                    <SubHeading text={"MY CONTRIBUTIONS"} type={"bold"} color={"black"} algn={"center"} />
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
