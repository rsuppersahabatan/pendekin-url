import { Heading, Text, Link } from "@chakra-ui/react";
import { InputForm } from "./components/InputForm";

export default function Homepage() {
    return (
        <>
            <Heading as="h3" size="xl" m={'3% 0% 2% 0%'}>
                URL Shortener
            </Heading>
            <InputForm />
            <Text m={'3%'}>
                Made with ❤️ by Me ({' '}
                <Link isExternal href="https://akshay-kumar-portfoilo.netlify.app/">
                    Akshay Kumar
                </Link>
                )
            </Text>
        </>
    );
}
