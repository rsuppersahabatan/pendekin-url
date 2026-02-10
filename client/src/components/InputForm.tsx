import React, { useState } from "react";
import axios from 'axios';
import {
    Box,
    FormControl,
    Input,
    FormHelperText,
    FormErrorMessage,
    FormLabel,
    Button,
    Flex,
    useClipboard,
    InputGroup,
    InputLeftAddon,
} from "@chakra-ui/react";
import styles from './InputForm.module.css';

export const InputForm = () => {
    const [input, setInput] = useState(
        {
            longUrl: "",
            urlCode: ""
        }
    );
    const [url, setUrl] = useState("");
    const [isLoading, setIsloading] = useState(false);
    const [isError, setIsError] = useState(false);
    const { hasCopied, onCopy } = useClipboard(url);
    const clientBaseUrl = window.location.href;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setInput({ ...input, [id]: value });
        setIsError(false);
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!input.longUrl) {
            setIsError(true);
            setUrl("Please add a URL");
            return;
        }
        setIsloading(true);
        axios.post('/api/url/shorten', input).then(res => {
            if (res.status) {
                let data = res.data;
                let createUrl = clientBaseUrl + data.urlCode;
                setUrl(createUrl);
            }
            console.log("res", res);
            setIsloading(false);
        }).catch(error => {
            let errorMsg = error.response?.data?.error || "An error occurred";
            setUrl(errorMsg);
            console.log("error", errorMsg);
            setIsloading(false);
        });
    };

    return (
        <Box
            width={"100%"}
            margin={"auto"}
            boxShadow="dark-lg"
            p="6"
            rounded="2xl"
            bg="dark"
            className={styles.mainContainer}>
            <FormControl isInvalid={isError}>
                <FormLabel>Paste a Long URL.</FormLabel>
                <Input
                    id="longUrl"
                    type="url"
                    value={input.longUrl}
                    placeholder="Paste your long URL here"
                    onChange={handleInputChange}
                    onKeyDown={handleEnter}
                />
                {!isError ? (
                    <FormHelperText>Enter your Long Url</FormHelperText>
                ) : (
                    <FormErrorMessage>URL is required.</FormErrorMessage>
                )}
            </FormControl>
            <FormLabel mt={7} fontSize='md'>Customize a personalized URL (Optional)</FormLabel>
            <InputGroup size='md' className={styles.InputGroup}>
                <InputLeftAddon children={`${clientBaseUrl}`} className={styles.BaseUrlAddon} w='50%' />
                <Input placeholder='your personalized code ' id="urlCode"
                    type="text"
                    value={input.urlCode}
                    onChange={handleInputChange}
                    w='50%'
                    onKeyDown={handleEnter}
                />
            </InputGroup>
            <Button type="submit"
                colorScheme="blue"
                m={5}
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText='Submitting'
            >
                Submit
            </Button>
            {url && <Flex mb={2}>
                <Input value={url} isReadOnly placeholder="Short Url" />
                <Button onClick={onCopy} ml={2}>
                    {hasCopied ? "Copied" : "Copy"}
                </Button>
            </Flex>}
        </Box>
    );
};
