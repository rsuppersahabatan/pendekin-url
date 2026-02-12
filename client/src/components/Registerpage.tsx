import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Stack,
    Text,
    useColorModeValue,
    Link as ChakraLink,
    InputGroup,
    InputRightElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

const MotionBox = motion(Box);

export default function Registerpage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration
        setTimeout(() => {
            setIsLoading(false);
            console.log('Registration attempt');
        }, 1500);
    };

    const glassBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');

    return (
        <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                py={{ base: '0', sm: '8' }}
                px={{ base: '4', sm: '10' }}
                bg={glassBg}
                backdropFilter="blur(10px)"
                boxShadow={useColorModeValue('xl', 'dark-lg')}
                borderRadius={{ base: 'none', sm: 'xl' }}
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
                <Stack spacing="8">
                    <Stack spacing="6" textAlign="center">
                        <Heading size={{ base: 'xs', md: 'sm' }}>Create an account</Heading>
                        <Text color="gray.500">
                            Already have an account? <ChakraLink as={RouterLink} to="/login" color="blue.500">Log in</ChakraLink>
                        </Text>
                    </Stack>
                    <Stack spacing="6" as="form" onSubmit={handleRegister}>
                        <Stack spacing="5">
                            <FormControl isRequired>
                                <FormLabel htmlFor="username">Username</FormLabel>
                                <Input id="username" type="text" placeholder="Enter your username" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel htmlFor="email">Email address</FormLabel>
                                <Input id="email" type="email" placeholder="Enter your email" />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel htmlFor="password">Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                    />
                                    <InputRightElement h={'full'} w={'max-content'} pr={2}>
                                        <Button
                                            variant={'ghost'}
                                            size={'sm'}
                                            onClick={() => setShowPassword((show) => !show)}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                        </Stack>
                        <Stack spacing="4">
                            <Button
                                type="submit"
                                colorScheme="blue"
                                size="lg"
                                fontSize="md"
                                isLoading={isLoading}
                                loadingText="Creating account..."
                                _hover={{
                                    transform: 'translateY(-2px)',
                                    boxShadow: 'lg',
                                }}
                                transition="all 0.2s"
                            >
                                Sign up
                            </Button>
                            <HStack>
                                <Divider />
                                <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
                                    or join with
                                </Text>
                                <Divider />
                            </HStack>
                            <HStack spacing="4">
                                <Button variant="outline" w="full">
                                    Google
                                </Button>
                                <Button variant="outline" w="full">
                                    GitHub
                                </Button>
                            </HStack>
                        </Stack>
                    </Stack>
                </Stack>
            </MotionBox>
        </Container>
    );
}
