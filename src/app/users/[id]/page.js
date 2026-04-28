"use client";
import { useProfile } from "@/components/UseProfile";
import UserFrom from "@/components/layout/UserForm";
import UserTabs from "@/components/layout/UserTabs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast'

export default function EditUserPage() {
  const { loading, data } = useProfile();
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/profile?_id="+id).then((res) => {
      res.json().then((user) => {
        setUser(user);
      });
    });
  }, [id]);

  async function handleSaveButtonClick(ev, data) {
    ev.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
      const response = await fetch('/api/profile', {
        method: "PUT",
        headers: {'Content-Type': "application/json"},
        body: JSON.stringify({...data, _id: id})
      });
      if (response.ok) resolve();
      else reject();
    });

    await toast.promise(promise, {
      loading: "Saving user...",
      success: 'User saved',
      error: 'An error has occured while saving the user'
    });
  }

  if (loading) {
    return "Loading user...";
  }

  if (!data?.admin) {
    return "Not an admin";
  }

  return (
    <section className="max-w-2xl mx-auto mt-8">
      <UserTabs isAdmin={true} />
      <div className="mt-8">
        <UserFrom user={user} onSave={handleSaveButtonClick} />
      </div>
    </section>
  );
}
