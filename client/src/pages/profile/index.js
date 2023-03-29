import moment from "moment";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetUser } from "../../redux/userSlice";
import { UpdateProfilePicture } from "../../apicalls/users";
import { axiosInstance } from "../../apicalls/index";


function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image = "", setImage] = React.useState("");
  const dispatch = useDispatch();



  const onFileSelect =  (e) => {
    const file = e.target.files[0];

      console.log(file);
      setImage(file);
    
  };
    
 /* const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      console.log(reader.result);
      setImage(reader.result);
    };
  };*/

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  const UpdateProfilePicture = async (image) => {
    let config = {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      };
      console.log('1',user);
      const formData = new FormData()
      formData.append('id', user._id);
      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('password', user.password);
      formData.append('image', image);
      
      const response = await axiosInstance.put(`/api/users/update-profile-picture/${user._id}`,formData,config)
        console.log('object',response);
        return response.data;

  }

  const updateProfilePic = async () => {
    try {
      dispatch(ShowLoader());
    
      const response = await UpdateProfilePicture(image);
      console.log('update',response);
      dispatch(HideLoader());
      if (response.success) {
        toast.success("Profile Pic Updated");
        dispatch(SetUser(response.data));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  return (
    user && (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-xl font-semibold uppercase text-gray-500 flex gap-2 flex-col p-2 shadow-md border w-max border-gray-300 rounded">
          <h1>{user.name}</h1>
          <h1>{user.email}</h1>
          <h1>
            Crée le:{" "}
            {moment(user.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
          </h1>
          {image && (
            <img
              src={image}
              alt="profile pic"
              className="w-32 h-32 rounded-full"
            />
          )}

          <div className="flex gap-2">
            <label htmlFor="file-input" className="cursor-pointer">
             Mettre à jour la photo de profile
            </label>
            <input
              type="file"
              onChange={onFileSelect}
              className="file-input border-0"
              id="file-input"
            />
            <button className="contained-btn" onClick={updateProfilePic}>
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default Profile;
