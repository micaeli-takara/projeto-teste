import { useContext, useEffect, useState } from "react";
import useProtectedPage from "../../hooks/useProtectedPage";
import axios from "axios";
import { BASE_URL } from "../../constants/url";
import { GlobalContext } from "../../context/GlobalContext";
import { useParams } from "react-router-dom";
import useForm from "../../hooks/useForm";
import Post from "../../components/Post/Post";
import {
    ContainerCommentsPage,
    ContainerComment,
    ButtonPost,
} from "./CommentsStyle";
import { ColoredLine } from "../LoginPage/LoginStyle";
import Comment from "../../components/Comment/Comment";

export default function CommentsPage() {
    useProtectedPage();
    const { id } = useParams();
    const { posts, getPosts } = useContext(GlobalContext);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const { form, onChange, cleanForm } = useForm({ content: "" });

    const getPostById = posts.find((post) => post.id === id);

    
    useEffect(() => {
        getComments();
        getPosts()

    }, [id]);

    const addNewComment = async () => {
        try {
            const body = {
                content: form.content,
            };
            const response = await axios.post(
                `${BASE_URL}/comments/${id}/post`,
                body,
                {
                    headers: {
                        Authorization: window.localStorage.getItem("token"),
                    },
                }
            );
            getComments([...comments, response.data]);
            cleanForm();
        } catch (error) {
            setError(error);
            console.error(error.response?.data || "Erro desconhecido");
        }
    };

    const handleDeleteComment = async (commentId) => {
        setIsDeleting(true);
        try {
            await axios.delete(`${BASE_URL}/comments/${commentId}/${getPostById.id}`, {
                headers: {
                    Authorization: window.localStorage.getItem("token"),
                },
            });
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            setError(error);
            console.error(error.response?.data || "Erro desconhecido");
        } finally {
            setIsDeleting(false);
        }
    };

    const getComments = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/comments/${id}/post`, {
                headers: {
                    Authorization: window.localStorage.getItem("token"),
                },
            });
            setComments(response.data);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            console.error(error.response?.data || "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <ContainerCommentsPage>
            {!isLoading ? <Post post={getPostById} isCommentPage={true} isDeletePage={true} /> : null}
            <ContainerComment>
                <textarea
                    type="text"
                    placeholder="Escreva seu post..."
                    name="content"
                    value={form.content}
                    onChange={onChange}
                />
                <ButtonPost onClick={addNewComment}>Responder</ButtonPost>
            </ContainerComment>
            <ColoredLine />
            {comments.map((comment, index) => {
                return (
                    <Comment
                        key={index}
                        comment={comment}
                        onDelete={handleDeleteComment}
                        comments={comments}
                        setComments={setComments}
                    />
                );
            })}
            {isDeleting && <div>Deletando comentário...</div>}
        </ContainerCommentsPage>
    );
}