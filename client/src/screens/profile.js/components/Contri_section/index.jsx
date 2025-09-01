import Container from "../../../../components/container";
import Contribution_card from "./ContributionCard";
import "./styles.scss";
import SubHeading from "../../../../components/subheading";
import { GetMyContributions, GetBrContribution } from "../../../../api/Contribution";
import { useSelector } from "react-redux";
import Loader from "../../../../components/Loader";

import { useEffect, useState } from "react";
import CourseCard from "../../../dashboard/components/coursecard";
const Contrisection = () => {
    const user = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);
    const [myContributions, setMyContributions] = useState([]);
    const isBR = useSelector((state) => state.user.user.isBR);
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
        if (isBR)
            callBack();
    }, []);

    const verifyBRContributions = (key, file) => {
        const index = brContributions.indexOf(key);
        const updatedKey = {
            ...key,
            files: key.files.map(f =>
                f === file ? { ...f, isVerified: true } : f
            )
        };
        const newContributions = [...brContributions];
        newContributions[index] = updatedKey;
        setBrContributions(newContributions);
    }
    const unverifyBRContributions = (key, file) => {
        const index = brContributions.indexOf(key);
        const updatedKey = {
            ...key,
            files: key.files.filter((f) => f !== file)
        }
        const newContributions = [...brContributions];
        newContributions[index] = updatedKey;
        setBrContributions(newContributions);
    }

    let ContriCard = [];
    for (const key of isBR ? brContributions : myContributions) {
        ContriCard.push(key.files.map((file) => (
            (!isBR || (isBR && !file.isVerified)) ?
                (
                    <Contribution_card
                        courseCode={key.courseCode}
                        uploadDate={key.updatedAt}
                        file={file}
                        key={file._id}
                        parentFolder={key.parentFolder}
                        verify={() => verifyBRContributions(key, file)}
                        unverify={() => unverifyBRContributions(key, file)}
                        isBR={isBR}
                    />
                ) :
                <></>

        )))
    }

    return isLoading ? (
        <Container color={"light"}>
            <div className="c_content">
                <div className="sub_head">
                    <SubHeading
                        text={(isBR)? "PENDING CONTRIBUTIONS": "YOUR CONTRIBUTIONS"}
                        type={"bold"}
                        color={"black"}
                        algn={"center"}
                    />
                </div>
                <Loader text={(isBR)? "Loading pending contributions":"Loading your contributions..."} />
            </div>
        </Container>
    ) : (
        <Container color={"light"}>
            <div className="c_content">
                <div className="sub_head">
                    <SubHeading
                        text={(isBR)? "PENDING CONTRIBUTIONS": "YOUR CONTRIBUTIONS"}
                        type={"bold"}
                        color={"black"}
                        algn={"center"}
                    />
                    {
                        (isBR)? (<div className="br-contrib-subheading">You can view a file by clicking on its name</div>) : (<></>)
                    }
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
