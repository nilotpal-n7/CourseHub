import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateUser } from "../../../../../api/User";
import { UpdateUserAction } from "../../../../../actions/user_actions";
import { useDispatch, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import "./styles.scss";
function SemCard(props) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const [isEditSem, setIsEditSem] = useState(false);
    const [userSem, setUserSem] = useState(user.user.semester);

    function editSemHandler(newSem) {
        setIsEditSem((prev) => !prev);
    }
    async function submitSemHandler() {
        const newUserData = {
            newUserSem: userSem,
        };
        if (!userSem || userSem > 8 || userSem < 1) {
            toast.error("Incorrect Semester field", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return;
        }
        setIsEditSem((prev) => !prev);
        dispatch(UpdateUserAction(newUserData));
        toast.success("Succesfully Updated", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        await updateUser(newUserData);
    }
    return (
        <div className="semCard">
            <div className="inner1">
                <div className="inputDiv">{props.sem}</div>
            </div>
            <div className="inner2">Semester</div>
        </div>
    );
}

export default SemCard;
