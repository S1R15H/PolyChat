import { LANGUAGE_TO_FLAG } from "../constants";
import { Link } from "react-router";

const TeacherCard = ({ teacher }) => {
    return (
        <div className="card bg-base-200 hover:shadow-md transitions-shadow">
            <div className="card-body p-4">
                {/* USER INFO */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="avatar size-12">
                        <img src={teacher.profilePic} alt={teacher.fullName} />
                    </div>
                    <h3 className="font-semibold truncate">{teacher.fullName}</h3>
                </div>

                <Link to={`/chat/${teacher._id}`} className="btn btn-outline w-full">
                    Message
                </Link>
            </div>
        </div>
    )
}

export default TeacherCard;