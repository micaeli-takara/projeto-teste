import { useContext, useEffect, useState } from "react"
import { GlobalContext } from "../../context/GlobalContext"
import useProtectedPage from "../../hooks/useProtectedPage";
import axios from "axios";
import { BASE_URL } from "../../constants/url";
import useForm from "../../hooks/useForm";
import {
    ButtonPost,
    ContainerPost,
    ContainerPostPage,
    ColoredLine,
} from "./PostsStyle";
import Post from "../../components/Post/Post";

export default function PostsPage() {
    useProtectedPage()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { posts, setPosts, getPosts } = useContext(GlobalContext)
    const { form, onChange, cleanForm } = useForm({
        content: "",
    });

    useEffect(() => {
        getPosts();
    }, []);

    const handleDeletePost = async (postId) => {
        setIsLoading(true);
        try {
            await axios.delete(`${BASE_URL}/posts/${postId}`, {
                headers: {
                    Authorization: window.localStorage.getItem("token"),
                },
            });
            setPosts(posts.filter((post) => post.id !== postId));
        } catch (error) {
            setError(error);
            alert(error.response.data)
            console.error(error.response?.data || "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };

    const addNewPost = async () => {
        try {
            const body = {
                content: form.content,
            };
            const response = await axios.post(`${BASE_URL}/posts`, body, {
                headers: {

                    Authorization: window.localStorage.getItem("token"),
                },
            });
            window.localStorage.setItem("token", response.data.output.token);
            setPosts();
            cleanForm();
        } catch (error) {
            console.log(error.response);
        }
    };

    return (
        <ContainerPostPage>
            <ContainerPost>
                <div className="inputForm">
                    <textarea
                        placeholder="Escreva seu post..."
                        name="content"
                        value={form.content}
                        onChange={onChange} 
                    />
                </div>
                <ButtonPost onClick={addNewPost}>Postar</ButtonPost>
            </ContainerPost>
            {isLoading && <p>Carregando...</p>}
            <ColoredLine />
            {posts.map((post, index) => {
                return (
                    <Post
                        key={index}
                        post={post}
                        onDelete={handleDeletePost}
                    />
                );
            })}
        </ContainerPostPage>
    )
}