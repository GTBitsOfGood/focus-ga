'use client'

import React, { useEffect, useRef, useState } from "react";
import { PostInput } from "@/utils/types/post";
import { createPost } from "@/server/db/actions/PostActions";
import { toast } from 'react-toastify';
import { postSchema } from "@/utils/types/post";

interface Props {
    onClose: () => void;
}

export default function CreatePostModal( props: Props ) {
    const [postData, setPostData] = useState({
        title: "",
        content: "",
        tags: []
    })

    const handleSubmit = () => {
        try {
            console.log("creating..")
            const formattedData = {
                title: postData.title,
                content: postData.content,
                tags: postData.tags
            }
            const { success, error, data } = postSchema.safeParse(formattedData);
            if (!success) {
                toast.error("Failed to create post");
            }
            toast.success("Post created successfully!");
            props.onClose();
            console.log("toast")
        } catch (error) {
            toast.error("Failed to create post");
        }
    }

    return (
        <div>
            <h2>Create New Post</h2>
            <div>
                <div>
                    <input 
                        value={postData.title}
                        maxLength = {100}
                        placeholder="Title*"
                        onChange={(event) => {
                            setPostData({ ... postData, title: event.target.value });
                        }}
                    />
                    <p>{postData.title.length}/100</p>
                </div>
                
            </div>
            <div>
                <div>
                    <input 
                        value={postData.content}
                        maxLength = {5000}
                        placeholder="Body*"
                        onChange={(event) => {
                            setPostData({ ... postData, content: event.target.value });
                        }}
                    />
                    <p>{postData.content.length}/5000</p>
                </div>
            </div>
            <div>
                <button onClick={props.onClose}>Cancel</button>
                <button onClick={() => handleSubmit()}>Post</button>
            </div>
        </div>
    );
}