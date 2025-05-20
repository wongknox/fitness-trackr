import { useEffect, useState } from "react";
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";

export default function ActivitiesPage() {
  const { token } = useAuth();
  const { request, invalidateTags } = useApi();
  const {
    data: activities,
    loading: activitiesLoading,
    error: activitiesError,
  } = useQuery("/activities", "activities");

  const { loading: deleteLoading, error: deleteError } = useMutation(
    "DELETE",
    `/activities/`,
    ["activities"]
  );

  const {
    mutate: addActivity,
    loading: addLoading,
    error: addError,
  } = useMutation("POST", "/activities", ["activities"]);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");

  const handleDelete = async (activityID) => {
    console.log("handleDelete called with activityID:", activityID);
    try {
      if (activityID === undefined || activityID === null) {
        console.error(
          "Attempted to delete with undefined/null activityID. Aborting delete."
        );
        return;
      }
      const deleteUrl = `/activities/${activityID}`;
      await request(deleteUrl, { method: "DELETE" });
      invalidateTags(["activities"]);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const handleAddActivity = async (event) => {
    event.preventDefault();
    if (newActivityName) {
      await addActivity({
        name: newActivityName,
        description: newActivityDescription,
      });
      setNewActivityName("");
      setNewActivityDescription("");
    } else {
      alert("Activity name is required.");
    }
  };

  if (activitiesLoading || deleteLoading || addLoading) {
    return <p>Loading activities...</p>;
  }

  if (activitiesError || deleteError || addError) {
    return <p>Error: {activitiesError || deleteError || addError}</p>;
  }

  return (
    <>
      <h1>Activities</h1>
      {token && (
        <div>
          <h2>Add New Activity</h2>
          <form onSubmit={handleAddActivity}>
            <label>
              Name:
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                value={newActivityDescription}
                onChange={(e) => setNewActivityDescription(e.target.value)}
              />
            </label>
            <button type="submit">Add Activity</button>
            {addError && <p>{addError}</p>}
          </form>
        </div>
      )}
      {activities?.length > 0 ? (
        <ul>
          {activities.map((activity) => {
            const handleDeleteClick = () => {
              handleDelete(activity.id);
            };
            return (
              <li key={activity.id}>
                {activity.name}
                {token && <button onClick={handleDeleteClick}>Delete</button>}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No activities available.</p>
      )}
      <p>Imagine all the activities!</p>
    </>
  );
}
