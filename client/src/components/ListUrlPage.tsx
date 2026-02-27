import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    Box,
    Container,
    Heading,
    Text,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    HStack,
    Badge,
    Link,
    Spinner,
    Alert,
    AlertIcon,
    AlertDescription,
    Flex,
    IconButton,
    Tooltip,
    useColorModeValue,
    useToast,
    TableContainer,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionTr = motion(Tr);

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShortUrl {
    _id: string;
    urlCode: string;
    longUrl: string;
    shortUrl: string;
    date: string;
    clicks: number;
}

type SortKey = "date" | "clicks";
type SortDir = "asc" | "desc";

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

const CopyIcon = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const SortAscIcon = () => (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 5l-7 7h14z" />
    </svg>
);

const SortDescIcon = () => (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 19l7-7H5z" />
    </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string): string => {
    const ts = parseInt(dateStr, 10);
    const d = isNaN(ts) ? new Date(dateStr) : new Date(ts);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const truncate = (str: string, maxLen = 55): string =>
    str.length > maxLen ? str.substring(0, maxLen) + "…" : str;

// ─── Component ────────────────────────────────────────────────────────────────
export default function ListUrlPage() {
    const [allData, setAllData] = useState<ShortUrl[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // DataTable states
    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState<SortKey>("date");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const toast = useToast();

    // ── Color tokens ────────────────────────────────────────────────────────
    const cardBg = useColorModeValue("white", "gray.800");
    const borderCol = useColorModeValue("gray.200", "gray.700");
    const headerBg = useColorModeValue("gray.50", "gray.700");
    const rowHoverBg = useColorModeValue("blue.50", "gray.700");
    const subText = useColorModeValue("gray.500", "gray.400");
    const thColor = useColorModeValue("gray.600", "gray.300");
    const inputBg = useColorModeValue("white", "gray.700");

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchUrls = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const res = await axios.get<ShortUrl[]>("/api/urls");
            setAllData(res.data);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { error?: string } } }).response?.data?.error
                || "Gagal mengambil data URL";
            setError(msg);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUrls();
    }, [fetchUrls]);

    // ── Sorting handler ──────────────────────────────────────────────────────
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
        setCurrentPage(1);
    };

    // ── Copy to clipboard ────────────────────────────────────────────────────
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Disalin!",
                description: text,
                status: "success",
                duration: 2000,
                isClosable: true,
                position: "top-right",
            });
        });
    };

    // ── Derived / computed data ───────────────────────────────────────────────
    const filtered = allData.filter(item => {
        const q = search.toLowerCase();
        return (
            item.urlCode.toLowerCase().includes(q) ||
            item.longUrl.toLowerCase().includes(q) ||
            item.shortUrl.toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === "date") {
            const da = parseInt(a.date, 10) || new Date(a.date).getTime();
            const db = parseInt(b.date, 10) || new Date(b.date).getTime();
            return sortDir === "desc" ? db - da : da - db;
        }
        // clicks
        return sortDir === "desc" ? b.clicks - a.clicks : a.clicks - b.clicks;
    });

    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const pageSafe = Math.min(currentPage, totalPages);
    const startIdx = (pageSafe - 1) * pageSize;
    const pageData = sorted.slice(startIdx, startIdx + pageSize);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // ── Pagination pages list ─────────────────────────────────────────────────
    const getPaginationPages = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (pageSafe > 3) pages.push("...");
            for (let i = Math.max(2, pageSafe - 1); i <= Math.min(totalPages - 1, pageSafe + 1); i++) {
                pages.push(i);
            }
            if (pageSafe < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    // ── Sort indicator ────────────────────────────────────────────────────────
    const SortIndicator = ({ col }: { col: SortKey }) =>
        sortKey === col ? (
            <Box as="span" ml={1} display="inline-flex" alignItems="center" color="blue.400">
                {sortDir === "desc" ? <SortDescIcon /> : <SortAscIcon />}
            </Box>
        ) : (
            <Box as="span" ml={1} display="inline-flex" alignItems="center" color="gray.400" opacity={0.5}>
                <SortDescIcon />
            </Box>
        );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Container maxW="container.xl" py={8} px={{ base: 2, md: 6 }}>
            {/* Header */}
            <Flex mb={6} align="center" justify="space-between" wrap="wrap" gap={3}>
                <Box>
                    <Heading size="lg" letterSpacing="tight">
                        Daftar Short URL
                    </Heading>
                    <Text fontSize="sm" color={subText} mt={1}>
                        Semua link yang telah diperpendek
                    </Text>
                </Box>
                <Tooltip label="Refresh data">
                    <IconButton
                        aria-label="Refresh"
                        icon={isRefreshing ? <Spinner size="sm" /> : <RefreshIcon />}
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => fetchUrls(true)}
                        isDisabled={isRefreshing || isLoading}
                    />
                </Tooltip>
            </Flex>

            {/* Card */}
            <Box
                bg={cardBg}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderCol}
                boxShadow="lg"
                overflow="hidden"
            >
                {/* Toolbar */}
                <Flex
                    px={5}
                    py={4}
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={3}
                    borderBottom="1px solid"
                    borderColor={borderCol}
                    bg={headerBg}
                >
                    <HStack spacing={2}>
                        <Text fontSize="sm" color={subText} whiteSpace="nowrap">Tampilkan</Text>
                        <Select
                            size="sm"
                            width="70px"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            bg={inputBg}
                            borderRadius="md"
                        >
                            {[10, 25, 50, 100].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </Select>
                        <Text fontSize="sm" color={subText} whiteSpace="nowrap">entri</Text>
                    </HStack>

                    <InputGroup maxW="300px" size="sm">
                        <InputLeftElement pointerEvents="none" color={subText}>
                            <SearchIcon />
                        </InputLeftElement>
                        <Input
                            placeholder="Cari URL atau kode…"
                            value={search}
                            onChange={handleSearchChange}
                            bg={inputBg}
                            borderRadius="md"
                        />
                    </InputGroup>
                </Flex>

                {/* Error */}
                {error && (
                    <Alert status="error" mx={5} mt={4} borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Table */}
                <TableContainer>
                    <Table variant="simple" size="sm">
                        <Thead bg={headerBg}>
                            <Tr>
                                <Th color={thColor} w="50px" pl={5}>#</Th>
                                <Th color={thColor}>Kode</Th>
                                <Th color={thColor}>URL Asli</Th>
                                <Th color={thColor}>Short URL</Th>
                                <Th
                                    color={thColor}
                                    cursor="pointer"
                                    _hover={{ color: "blue.400" }}
                                    onClick={() => handleSort("clicks")}
                                    userSelect="none"
                                    whiteSpace="nowrap"
                                >
                                    <Flex align="center">
                                        Klik
                                        <SortIndicator col="clicks" />
                                    </Flex>
                                </Th>
                                <Th
                                    color={thColor}
                                    cursor="pointer"
                                    _hover={{ color: "blue.400" }}
                                    onClick={() => handleSort("date")}
                                    userSelect="none"
                                    whiteSpace="nowrap"
                                    pr={5}
                                >
                                    <Flex align="center">
                                        Dibuat
                                        <SortIndicator col="date" />
                                    </Flex>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={6} textAlign="center" py={16}>
                                        <Flex justify="center" align="center" gap={3}>
                                            <Spinner color="blue.500" size="md" />
                                            <Text color={subText}>Memuat data…</Text>
                                        </Flex>
                                    </Td>
                                </Tr>
                            ) : pageData.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6} textAlign="center" py={16}>
                                        <Text color={subText}>
                                            {search ? "Tidak ada data yang cocok dengan pencarian." : "Belum ada URL yang dipersingkat."}
                                        </Text>
                                    </Td>
                                </Tr>
                            ) : (
                                <AnimatePresence>
                                    {pageData.map((item, idx) => (
                                        <MotionTr
                                            key={item._id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15, delay: idx * 0.03 }}
                                            _hover={{ bg: rowHoverBg }}
                                        >
                                            <Td pl={5} color={subText} fontSize="xs">
                                                {startIdx + idx + 1}
                                            </Td>
                                            <Td>
                                                <Badge colorScheme="blue" fontSize="0.78em" px={2} py={0.5} borderRadius="md">
                                                    {item.urlCode}
                                                </Badge>
                                            </Td>
                                            <Td maxW="280px">
                                                <Tooltip label={item.longUrl} openDelay={400} hasArrow>
                                                    <Link
                                                        href={item.longUrl}
                                                        isExternal
                                                        color="blue.400"
                                                        fontSize="sm"
                                                        _hover={{ textDecoration: "underline" }}
                                                        display="block"
                                                        isTruncated
                                                        maxW="270px"
                                                    >
                                                        {truncate(item.longUrl)}
                                                    </Link>
                                                </Tooltip>
                                            </Td>
                                            <Td>
                                                <HStack spacing={1}>
                                                    <Tooltip label={item.shortUrl} openDelay={400} hasArrow>
                                                        <Link
                                                            href={item.shortUrl}
                                                            isExternal
                                                            color="green.400"
                                                            fontSize="sm"
                                                            fontWeight="semibold"
                                                            _hover={{ textDecoration: "underline" }}
                                                            isTruncated
                                                            maxW="140px"
                                                        >
                                                            {item.shortUrl.replace(/^https?:\/\//, "")}
                                                        </Link>
                                                    </Tooltip>
                                                    <Tooltip label="Salin" hasArrow>
                                                        <IconButton
                                                            aria-label="Copy short URL"
                                                            icon={<CopyIcon />}
                                                            size="xs"
                                                            variant="ghost"
                                                            colorScheme="gray"
                                                            onClick={() => handleCopy(item.shortUrl)}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <Badge
                                                    colorScheme={item.clicks > 0 ? "green" : "gray"}
                                                    variant="subtle"
                                                    px={2}
                                                    borderRadius="full"
                                                >
                                                    {item.clicks.toLocaleString("id-ID")}
                                                </Badge>
                                            </Td>
                                            <Td pr={5} color={subText} fontSize="xs" whiteSpace="nowrap">
                                                {formatDate(item.date)}
                                            </Td>
                                        </MotionTr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </Tbody>
                    </Table>
                </TableContainer>

                {/* Footer / Pagination */}
                <Flex
                    px={5}
                    py={4}
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={3}
                    borderTop="1px solid"
                    borderColor={borderCol}
                    bg={headerBg}
                >
                    <Text fontSize="sm" color={subText}>
                        {totalItems === 0
                            ? "Tidak ada entri"
                            : `Menampilkan ${startIdx + 1}–${Math.min(startIdx + pageSize, totalItems)} dari ${totalItems.toLocaleString("id-ID")} entri`
                        }
                        {search && allData.length !== totalItems && (
                            <> (difilter dari {allData.length.toLocaleString("id-ID")} total entri)</>
                        )}
                    </Text>

                    <HStack spacing={1} wrap="wrap">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(1)}
                            isDisabled={pageSafe === 1}
                        >
                            «
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            isDisabled={pageSafe === 1}
                        >
                            ‹
                        </Button>

                        {getPaginationPages().map((p, i) =>
                            p === "..." ? (
                                <Text key={`ellipsis-${i}`} px={2} color={subText} fontSize="sm">…</Text>
                            ) : (
                                <Button
                                    key={p}
                                    size="sm"
                                    variant={pageSafe === p ? "solid" : "outline"}
                                    colorScheme={pageSafe === p ? "blue" : "gray"}
                                    onClick={() => setCurrentPage(p as number)}
                                    minW="8"
                                >
                                    {p}
                                </Button>
                            )
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            isDisabled={pageSafe === totalPages}
                        >
                            ›
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(totalPages)}
                            isDisabled={pageSafe === totalPages}
                        >
                            »
                        </Button>
                    </HStack>
                </Flex>
            </Box>
        </Container>
    );
}
