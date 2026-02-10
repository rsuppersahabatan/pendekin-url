import { Box, Heading, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ShortUrlRedirect() {
    const { urlCode } = useParams();
    const redirect = () => {
        let url = `/${urlCode}`;
        window.location.replace(url);
    };

    useEffect(() => {
        if (urlCode) {
            redirect();
        }
    }, [urlCode]);

    return (
        <VStack spacing={6} alignItems="center" justifyContent="center" minH="50vh">
            <Box position="relative" width="200px" height="200px">
                <svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f093fb" />
                            <stop offset="100%" stopColor="#f5576c" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4facfe" />
                            <stop offset="100%" stopColor="#00f2fe" />
                        </linearGradient>
                    </defs>

                    {/* Outer rotating circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke="url(#gradient1)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="502"
                        strokeDashoffset="0"
                        opacity="0.3"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 100 100"
                            to="360 100 100"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;502;0"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    {/* Middle rotating path */}
                    <path
                        d="M 100 30 Q 170 100 100 170 Q 30 100 100 30"
                        stroke="url(#gradient2)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="400"
                        strokeDashoffset="0"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 100 100"
                            to="-360 100 100"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;-400;0"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="0.8;1;0.8"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Inner animated path */}
                    <path
                        d="M 100 50 L 140 100 L 100 150 L 60 100 Z"
                        stroke="url(#gradient3)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="200"
                        strokeDashoffset="0"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 100 100"
                            to="360 100 100"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="stroke-dashoffset"
                            values="0;200;0"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Center pulsing circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r="8"
                        fill="url(#gradient1)"
                    >
                        <animate
                            attributeName="r"
                            values="8;12;8"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="opacity"
                            values="1;0.5;1"
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    {/* Orbital dots */}
                    <circle
                        cx="100"
                        cy="40"
                        r="5"
                        fill="#667eea"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 100 100"
                            to="360 100 100"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle
                        cx="100"
                        cy="40"
                        r="5"
                        fill="#f5576c"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="120 100 100"
                            to="480 100 100"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle
                        cx="100"
                        cy="40"
                        r="5"
                        fill="#00f2fe"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="240 100 100"
                            to="600 100 100"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </Box>
            <Heading as="h3" size="lg" fontWeight="600" color="gray.700">
                Redirecting...
            </Heading>
        </VStack>
    );
}
