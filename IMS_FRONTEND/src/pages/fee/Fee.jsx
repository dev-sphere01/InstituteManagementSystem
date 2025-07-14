import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for demonstration
const mockCourses = [
    { id: 1, name: "Mathematics", price: "5000", icon: "📊", color: "blue" },
    { id: 2, name: "Physics", price: "5000", icon: "⚛️", color: "green" },
    { id: 3, name: "Chemistry", price: "5000", icon: "🧪", color: "purple" },
    { id: 4, name: "Biology", price: "4000", icon: "🧬", color: "red" },
    { id: 5, name: "English", price: "3000", icon: "📚", color: "orange" },
];

const mockStudentData = {
    student: {
        id: 1,
        enrollmentNumber: "ENR001",
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        dateOfBirth: "1998-05-15",
        totalPrice: "15000",
        paidAmount: "10000",
        paidEmis: 2,
        remainingEmis: 1,
        nextEmiDate: "2025-07-15",
    },
    courses: [
        { id: 1, name: "Mathematics", price: "5000", icon: "📊", color: "blue" },
        { id: 2, name: "Physics", price: "5000", icon: "⚛️", color: "green" },
        { id: 3, name: "Chemistry", price: "5000", icon: "🧪", color: "purple" },
    ],
    paymentHistory: [
        { id: 1, amount: "5000", method: "Online", receiptNumber: "RCPT001", paymentDate: "2025-05-01" },
        { id: 2, amount: "5000", method: "Cash", receiptNumber: "RCPT002", paymentDate: "2025-06-01" },
    ]
};

// Floating Input Component
const FloatingInput = ({ id, label, value, onChange, type = "text", className = "" }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.trim() !== "";
    const shouldFloat = isFocused || hasValue;

    return (
        <div className={`relative ${className}`}>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full px-3 border border-gray-300 bg-white rounded-md text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${shouldFloat ? 'pt-6 pb-2' : 'py-4'
                    }`}
            />
            <label
                htmlFor={id}
                className={`absolute left-3 text-gray-500 transition-all duration-200 pointer-events-none bg-white px-1 ${shouldFloat
                    ? 'top-0 text-xs text-blue-600 -translate-y-1/2 scale-90'
                    : 'top-4 text-sm'
                    }`}
            >
                {label}
            </label>
        </div>
    );
};

// Button Component
const Button = ({ children, onClick, disabled = false, className = "", variant = "primary" }) => {
    const baseClasses = "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        success: "bg-green-600 text-white hover:bg-green-700",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

// Card Component
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = "" }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = "" }) => (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h3>
);

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Progress Component
const Progress = ({ value, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);

// Table Components
const Table = ({ children, className = "" }) => (
    <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
            {children}
        </table>
    </div>
);

const TableHeader = ({ children }) => (
    <thead className="bg-gray-50">
        {children}
    </thead>
);

const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">
        {children}
    </tbody>
);

const TableRow = ({ children, className = "" }) => (
    <tr className={`hover:bg-gray-50 ${className}`}>
        {children}
    </tr>
);

const TableHead = ({ children, className = "" }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
        {children}
    </th>
);

const TableCell = ({ children, className = "" }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
        {children}
    </td>
);

// Radio Group Components
const RadioGroup = ({ value, onValueChange, children, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        {React.Children.map(children, (child) =>
            React.cloneElement(child, { selectedValue: value, onValueChange })
        )}
    </div>
);

const RadioGroupItem = ({ value, id, selectedValue, onValueChange }) => (
    <input
        type="radio"
        id={id}
        value={value}
        checked={selectedValue === value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
);

// Select Components
const Select = ({ value, onValueChange, children, className = "" }) => (
    <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
        {children}
    </select>
);

const SelectItem = ({ value, children }) => (
    <option value={value}>{children}</option>
);

// Checkbox Component
const Checkbox = ({ id, checked, onCheckedChange, className = "" }) => (
    <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${className}`}
    />
);

// Label Component
const Label = ({ htmlFor, children, className = "" }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
        {children}
    </label>
);

// Separator Component
const Separator = ({ className = "" }) => (
    <hr className={`border-gray-200 ${className}`} />
);

// Toast Hook (simplified)
const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const toast = ({ title, description, variant = "default" }) => {
        const id = Date.now();
        const newToast = { id, title, description, variant };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return { toast, toasts };
};

// Toaster Component
const Toaster = ({ toasts }) => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
            <div
                key={toast.id}
                className={`p-4 rounded-lg shadow-lg max-w-sm ${toast.variant === 'destructive'
                    ? 'bg-red-500 text-white'
                    : 'bg-white border border-gray-200'
                    }`}
            >
                <div className="font-medium">{toast.title}</div>
                {toast.description && (
                    <div className="text-sm mt-1">{toast.description}</div>
                )}
            </div>
        ))}
    </div>
);

// Color mappings
const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
};

// Main Fee Management Component
const FeeManagement = () => {
    const [enrollmentNumber, setEnrollmentNumber] = useState("");
    const [studentExists, setStudentExists] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [paymentType, setPaymentType] = useState("emi");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("online");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [newStudent, setNewStudent] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        enrollmentNumber: "",
    });
    const [selectedCourses, setSelectedCourses] = useState([]);
    const { toast, toasts } = useToast();

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleFetchDetails = async () => {
        if (!enrollmentNumber.trim()) {
            toast({
                title: "Error",
                description: "Please enter an enrollment number",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            if (enrollmentNumber === "ENR001") {
                setStudentExists(true);
                setStudentData(mockStudentData);
                setPaymentAmount("5000");
            } else {
                setStudentExists(false);
                setNewStudent(prev => ({ ...prev, enrollmentNumber }));
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleProcessPayment = () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast({
                title: "Error",
                description: "Please enter a valid payment amount",
                variant: "destructive",
            });
            return;
        }

        // Simulate payment processing
        toast({
            title: "Success",
            description: "Payment processed successfully",
        });

        // Update payment history
        const newPayment = {
            id: Date.now(),
            amount: paymentAmount,
            method: paymentMethod,
            receiptNumber: `RCPT${String(Date.now()).slice(-3)}`,
            paymentDate: new Date().toISOString().split('T')[0],
        };

        setStudentData(prev => ({
            ...prev,
            paymentHistory: [newPayment, ...prev.paymentHistory],
        }));

        setPaymentAmount("");
    };

    const handleSaveAndPay = () => {
        if (!newStudent.fullName || selectedCourses.length === 0) {
            toast({
                title: "Error",
                description: "Please fill in all required fields and select at least one course",
                variant: "destructive",
            });
            return;
        }

        const totalPrice = selectedCourses.reduce((sum, courseId) => {
            const course = mockCourses.find(c => c.id === courseId);
            return sum + (course ? parseFloat(course.price) : 0);
        }, 0);

        // Simulate student creation
        toast({
            title: "Success",
            description: "Student created successfully",
        });

        setStudentExists(true);
        setStudentData({
            student: {
                ...newStudent,
                id: Date.now(),
                totalPrice: totalPrice.toString(),
                paidAmount: "0",
                paidEmis: 0,
                remainingEmis: 0,
            },
            courses: selectedCourses.map(id => mockCourses.find(c => c.id === id)),
            paymentHistory: [],
        });
    };

    const handleCourseSelection = (courseId, checked) => {
        setSelectedCourses(prev =>
            checked
                ? [...prev, courseId]
                : prev.filter(id => id !== courseId)
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPaymentProgress = () => {
        if (!studentData) return 0;
        const paid = parseFloat(studentData.student.paidAmount);
        const total = parseFloat(studentData.student.totalPrice);
        return (paid / total) * 100;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster toasts={toasts} />

            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Enrollment Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-600">🔍</span>
                                </div>
                                <div>
                                    <CardTitle>Student Lookup</CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Enter enrollment number to fetch student details
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <FloatingInput
                                        id="enrollmentNumber"
                                        label="Enrollment Number"
                                        value={enrollmentNumber}
                                        onChange={setEnrollmentNumber}
                                    />
                                </div>
                                <Button
                                    onClick={handleFetchDetails}
                                    disabled={isLoading}
                                    className="px-6 py-3"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "🔍"
                                    )}
                                    <span className="ml-2">Fetch Details</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Student Flow */}
                <AnimatePresence mode="wait">
                    {studentExists === true && studentData && (
                        <motion.div
                            key="existing-student"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Student Information */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-green-600">🏫</span>
                                            </div>
                                            <div>
                                                <CardTitle>Student Information</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Enrollment details and payment status
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                                                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                                        {studentData.student.fullName}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-600">Total Price</Label>
                                                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                                        {formatCurrency(studentData.student.totalPrice)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-600">Paid EMIs</Label>
                                                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                                        {studentData.student.paidEmis}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-600">Remaining EMIs</Label>
                                                    <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                                        {studentData.student.remainingEmis}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-sm font-medium text-gray-600">Next EMI Date</Label>
                                                <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md">
                                                    {studentData.student.nextEmiDate ? formatDate(studentData.student.nextEmiDate) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment Status */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <span className="text-orange-600">💳</span>
                                            </div>
                                            <div>
                                                <CardTitle>Payment Status</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Current payment overview
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b">
                                            <span className="text-sm text-gray-600">Total Amount</span>
                                            <span className="font-semibold">{formatCurrency(studentData.student.totalPrice)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b">
                                            <span className="text-sm text-gray-600">Paid Amount</span>
                                            <span className="font-semibold text-green-600">{formatCurrency(studentData.student.paidAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b">
                                            <span className="text-sm text-gray-600">Due Amount</span>
                                            <span className="font-semibold text-red-600">
                                                {formatCurrency((parseFloat(studentData.student.totalPrice) - parseFloat(studentData.student.paidAmount)).toString())}
                                            </span>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Payment Progress</span>
                                                <span className="text-sm font-medium">{Math.round(getPaymentProgress())}%</span>
                                            </div>
                                            <Progress value={getPaymentProgress()} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enrolled Courses */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600">📚</span>
                                        </div>
                                        <div>
                                            <CardTitle>Enrolled Courses</CardTitle>
                                            <p className="text-sm text-gray-600">
                                                Courses selected for this student
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {studentData.courses.map((course) => (
                                            <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[course.color]}`}>
                                                        <span>{course.icon}</span>
                                                    </div>
                                                    <h4 className="font-medium">{course.name}</h4>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Course Fee</span>
                                                    <span className="font-semibold">{formatCurrency(course.price)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-green-600">💰</span>
                                            </div>
                                            <div>
                                                <CardTitle>Make Payment</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Choose payment method and amount
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Payment Type</Label>
                                            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="emi" id="emi" />
                                                    <Label htmlFor="emi">EMI Payment</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="full" id="full" />
                                                    <Label htmlFor="full">Full Payment</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <FloatingInput
                                            id="paymentAmount"
                                            label="Amount Being Paid (₹)"
                                            type="number"
                                            value={paymentAmount}
                                            onChange={setPaymentAmount}
                                        />

                                        <div>
                                            <Label className="text-sm font-medium mb-3 block">Payment Method</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectItem value="online">Online Payment</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="cheque">Cheque</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleProcessPayment}
                                            variant="success"
                                            className="w-full"
                                        >
                                            <span>💳</span>
                                            <span className="ml-2">Process Payment</span>
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Payment History */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-600">🧾</span>
                                            </div>
                                            <div>
                                                <CardTitle>Payment History</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Recent payment transactions
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Receipt</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentData.paymentHistory.map((payment) => (
                                                    <TableRow key={payment.id}>
                                                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                        <TableCell className="font-medium text-green-600">
                                                            {formatCurrency(payment.amount)}
                                                        </TableCell>
                                                        <TableCell>{payment.method}</TableCell>
                                                        <TableCell className="text-blue-600">{payment.receiptNumber}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {studentExists === false && (
                        <motion.div
                            key="new-student"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-blue-600">👤➕</span>
                                        </div>
                                        <div>
                                            <CardTitle>New Student Admission</CardTitle>
                                            <p className="text-sm text-gray-600">
                                                Fill in the student details for new admission
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FloatingInput
                                            id="newStudentName"
                                            label="Full Name"
                                            value={newStudent.fullName}
                                            onChange={(value) => setNewStudent(prev => ({ ...prev, fullName: value }))}
                                        />
                                        <FloatingInput
                                            id="newStudentEmail"
                                            label="Email Address"
                                            type="email"
                                            value={newStudent.email}
                                            onChange={(value) => setNewStudent(prev => ({ ...prev, email: value }))}
                                        />
                                        <FloatingInput
                                            id="newStudentPhone"
                                            label="Phone Number"
                                            type="tel"
                                            value={newStudent.phone}
                                            onChange={(value) => setNewStudent(prev => ({ ...prev, phone: value }))}
                                        />
                                        <FloatingInput
                                            id="newStudentDob"
                                            label="Date of Birth"
                                            type="date"
                                            value={newStudent.dateOfBirth}
                                            onChange={(value) => setNewStudent(prev => ({ ...prev, dateOfBirth: value }))}
                                        />
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-lg font-semibold mb-4">Available Courses</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {mockCourses.map((course) => (
                                                <div key={course.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <Checkbox
                                                            id={`course-${course.id}`}
                                                            checked={selectedCourses.includes(course.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleCourseSelection(course.id, checked)
                                                            }
                                                        />
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[course.color]}`}>
                                                            <span>{course.icon}</span>
                                                        </div>
                                                        <h4 className="font-medium">{course.name}</h4>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Course Fee</span>
                                                        <span className="font-semibold">{formatCurrency(course.price)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <Button
                                            onClick={handleSaveAndPay}
                                            className="px-8 py-3"
                                        >
                                            <span>💾</span>
                                            <span className="ml-2">Save & Pay</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default FeeManagement;