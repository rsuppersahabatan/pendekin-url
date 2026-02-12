import { Heading, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ShortUrlRedirect() {
    const { urlCode } = useParams();

    useEffect(() => {
        if (urlCode) {
            const timer = setTimeout(() => {
                window.location.replace(`/${urlCode}`);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [urlCode]);

    return (
        <div className="loader-container">
            <span className="loader"></span>
            <Heading as="h3" size="lg" color="gray.600">
                Redirecting...
            </Heading>
            <Text color="gray.500">
                Please wait while we take you to your destination.
            </Text>
        </div>
    );
}
