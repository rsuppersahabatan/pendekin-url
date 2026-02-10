import { Heading, Text, Link } from "@chakra-ui/react";
import { InputForm } from "./components/InputForm.tsx";

export default function Homepage() {
    return (
        <>
            <Heading as="h3" size="xl" m={'3% 0% 2% 0%'}>
                URL Shortener
            </Heading>
            <InputForm />
            <Text m={'2%'}>
                Based On ({' '}
                <Link isExternal href="https://akshay-kumar-portfoilo.netlify.app/">
                    Akshay Kumar
                </Link>
                ) & Modified By ({' '}
                <Link isExternal href="https://github.com/rsuppersahabatan/pendekin-url">
                    M Desta Fadilah
                </Link>
                )
            </Text>
        </>
    );
}
