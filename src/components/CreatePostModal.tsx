'use client'

import React, { useEffect, useState, Suspense } from "react";
import { createPost } from "@/server/db/actions/PostActions";
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import 'react-markdown-editor-lite/lib/index.css';
import { Disability } from "@/utils/types/disability";
import Tag from "./Tag";
import dynamic from 'next/dynamic'

const maxTitleLength = 100;
const maxContentLength = 5000;

const EditorComp = dynamic(() => import('./EditorComponent'), { ssr: false })

interface Props {
    notifySuccess: () => void;
    notifyFailure: () => void;
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

interface PostData {
    title: string;
    content: string;
    tags: Disability[];
}

export default function CreatePostModal( props: Props ) {
    const [postData, setPostData] = useState<PostData>({
        title: "",
        content: "",
        tags: []
    });
    const [showTitleError, setTitleError] = useState(false);
    const [showBodyError, setBodyError] = useState(false);
    const [showDisabilities, setShowDisabilities] = useState(false);
    const [disabilities, setDisabilities] = useState<Disability[]>([]);

    useEffect(() => {
        const fetchDisabilities = async () => {
            try {
                const disabilityList = await getDisabilities();
                setDisabilities(disabilityList);
            } catch (error) {
                console.error("failed to fetch disabilities")
            }
        }

        fetchDisabilities();
    }, [])

    
    const generateObjectId = (): string => {
        return (
          Math.floor(Date.now() / 1000).toString(16) +
          'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
            return ((Math.random() * 16) | 0).toString(16);
          }).toLowerCase()
        );
    };

    const handleSubmit = async () => {
        try {
            if (postData.title.length > 0 && postData.content.length > 0) {
                const formattedData = {
                    author: generateObjectId(), // TODO: replace with actual userid 
                    title: postData.title,
                    content: postData.content,
                    tags: postData.tags.map((tag) => tag._id)
                }

                const createdPost = await createPost(formattedData);
                props.closeModal();
                props.notifySuccess();
                setPostData({
                    title: "",
                    content: "",
                    tags: []
                });
            } else {
                if (postData.title.length == 0) {
                    setTitleError(true);
                } else {
                    setTitleError(false);
                }
                if (postData.content.length == 0) {
                    setBodyError(true)
                } else {
                    setBodyError(false);
                }
            }
        } catch (error) {
            props.notifyFailure();
        }
    }

    const handleClose = () => {
        props.closeModal();
        setBodyError(false);
        setTitleError(false);
    }

    function countNonMarkdownCharacters(content: string): number {
        // Remove markdown-related characters such as formatting symbols for bold/italic/underline and lists
        const cleanedContent = content.replace(/(\*\*|__|\*|_|~~|`|\[.*?\]\(.*?\)|<.*?>|#|>|-|\+|\d+\.)/g, '')
                                .replace(/\s+/g, '');
        return cleanedContent.length;
    }

    const handleEditorChange = (text: string) => {
        const textLength = countNonMarkdownCharacters(text);
        if (textLength <= maxContentLength) {
            setPostData({ ... postData, content: text });
        }
    }

    const toggleDisability = (name: Disability) => {
        if (postData.tags.length < 5) {
            const newTags = postData.tags.includes(name)
            ? postData.tags.filter((d) => d !== name)
            : [...postData.tags, name];
        
            setPostData({ ...postData, tags: newTags });
        } else if (postData.tags.length == 5) {
            const newTags = postData.tags.filter((d) => d !== name)
            setPostData({ ...postData, tags: newTags });
        }
    };

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        props.isOpen ? 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={handleBackgroundClick}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl h-full max-h-[70%] relative z-50 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-black text-xl font-bold">Create New Post</div>
                    <svg onClick={handleClose} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </div>
                
                <div className="relative mb-4">
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700">
                        Title
                        <span className="text-[#ff4e4e] text-base font-medium">*</span>
                    </label>
                    <div className={`w-full mt-1 p-3 border ${showTitleError ? 'border-[#ff4e4e]' : 'border-gray-300'} rounded-md flex justify-between items-center`}>
                        <input
                            id="title"
                            value={postData.title}
                            maxLength={100}
                            placeholder="Enter post title"
                            onChange={(event) => setPostData({ ...postData, title: event.target.value })}
                            className="focus:outline-none w-[89%]"
                        />
                        <div className="text-gray-400 text-sm">
                            {postData.title.length}/{maxTitleLength}
                        </div>
                    </div>
                    
                    {showTitleError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : null }
                </div>
                
                <div className="relative mb-4 h-[50%]">
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700">
                        Body
                        <span className="text-[#ff4e4e] text-base font-medium">*</span>
                    </label>
                    <div className={`mt-1 rounded-lg h-[85%] border ${showBodyError ? 'border-red-300 border-2' : ''}`}>
                        <Suspense fallback={null}>
                            <EditorComp markdown={postData.content} handleEditorChange={handleEditorChange}/>
                        </Suspense>
                    </div>
                    <div className="flex justify-between">
                        {showBodyError ? <div className="text-[#ff4e4e] text-sm font-normal">Required Field</div> : <div></div> }
                        <p className="text-sm text-gray-400 text-right">{countNonMarkdownCharacters(postData.content)}/{maxContentLength}</p>
                    </div>
                </div>

                <div className="relative mb-4">
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700">
                        Disability Tags
                    </label>
                    <div className="w-full mt-1 border border-gray-300 rounded-md">
                        <div onClick={() => setShowDisabilities(!showDisabilities)} className="relative flex items-center m-3 cursor-pointer">
                            <div className="flex items-center w-full">
                                {postData.tags.length == 0 ? 
                                    <div className="text-neutral-400 text-sm font-normal">
                                        Add disability tags (up to five)
                                    </div> : 
                                    postData.tags.map((disability) => <div  key={disability._id} onClick={(e) => {e.stopPropagation(), toggleDisability(disability)}}><Tag className="mr-2" text={disability.name}/></div>)
                                }
                            </div>
                            
                            <div className={`transition-transform duration-300 ${showDisabilities ? 'scale-y-[-1]' : ''}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="#7d7e82"
                                    className="size-6"
                                    >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                    />
                                </svg>
                            </div>
                            
                        </div>
                        {showDisabilities && (
                            <ul className="absolute z-10 bg-white border border-gray-300 rounded-bl-lg rounded-br-lg w-full p-2 max-h-40 overflow-y-auto">
                                {disabilities.map((disability) => (
                                    <li
                                    key={disability._id}
                                    onClick={() => toggleDisability(disability)}
                                    className={`flex items-center p-2 cursor-pointer rounded-lg py-2 hover:bg-gray-100 h-10`}
                                    >
                                    { postData.tags.includes(disability) ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                    </svg> : null}
                                    {disability.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-bold"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="h-[38px] px-[25px] py-2 bg-[#475cc6] rounded-lg justify-center items-center gap-2.5 inline-flex">
                        <div className="bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold">Post</div>
                    </button>
                </div>
            </div> 
        </div> 
        : null
    );
}