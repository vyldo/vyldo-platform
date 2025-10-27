import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Copy, Check, AlertCircle, Info, ExternalLink, Upload, X, CheckCircle } from 'lucide-react';

export default function Checkout() {
  const { gigId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState(searchParams.get('package') || 'basic');
  const [requirements, setRequirements] = useState('');
  const [requirementImages, setRequirementImages] = useState([]);
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: gig, isLoading } = useQuery(['gig', gigId], async () => {
    const res = await api.get(`/gigs/${gigId}`);
    return res.data.gig;
  });

  // Generate unique memo for this order
  const [memo, setMemo] = useState('');
  useEffect(() => {
    if (gig && user) {
      // Generate unique memo: VYLDO-{gigId-last6}-{userId-last6}-{timestamp-last6}
      const gigPart = gig._id.slice(-6);
      const userPart = user._id.slice(-6);
      const timePart = Date.now().toString().slice(-6);
      setMemo(`VYLDO-${gigPart}-${userPart}-${timePart}`);
    }
  }, [gig, user]);

  const createOrderMutation = useMutation(
    async (data) => {
      setVerifying(true);
      const res = await api.post('/orders', {
        gigId: gig._id,
        packageType: selectedPackage,
        requirements,
        transactionId,
        memo
      });
      return res.data;
    },
    {
      onSuccess: (data) => {
        setVerifying(false);
        navigate(`/orders/${data.order._id}`);
      },
      onError: (error) => {
        setVerifying(false);
        alert(error.response?.data?.message || 'Failed to create order');
      }
    }
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (requirementImages.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setRequirementImages([...requirementImages, ...files]);
  };

  const removeImage = (index) => {
    setRequirementImages(requirementImages.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-1/3"></div>
          <div className="skeleton h-64"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Gig not found</h2>
      </div>
    );
  }

  const pkg = gig.packages[selectedPackage];
  if (!pkg) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Package not available</h2>
      </div>
    );
  }

  const escrowAccount = 'vyldo-escrow';
  const amount = pkg.price;
  
  // Calculate platform fee (from total, not added)
  const calculateFee = (price) => {
    let feePercentage;
    if (price >= 1 && price < 2000) feePercentage = 0.09;
    else if (price >= 2000 && price < 5000) feePercentage = 0.08;
    else if (price >= 5000 && price < 9000) feePercentage = 0.07;
    else if (price >= 9000) feePercentage = 0.06;
    else feePercentage = 0.09;
    
    const fee = price * feePercentage;
    const sellerEarnings = price - fee;
    
    return {
      platformFee: parseFloat(fee.toFixed(3)),
      sellerEarnings: parseFloat(sellerEarnings.toFixed(3)),
      feePercentage: (feePercentage * 100).toFixed(0)
    };
  };
  
  const feeBreakdown = calculateFee(pkg.price);

  const steps = [
    { number: 1, title: 'Requirements', completed: requirements.trim() !== '' },
    { number: 2, title: 'Payment', completed: transactionId.trim() !== '' },
    { number: 3, title: 'Confirm', completed: false }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
      <p className="text-gray-600 mb-4">Review your order and make payment</p>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.number 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? <CheckCircle className="w-6 h-6" /> : step.number}
                </div>
                <span className="text-xs mt-1 font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Info */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Gig Details</h2>
            <div className="flex gap-4">
              <img
                src={gig.images?.[0] || '/placeholder.jpg'}
                alt={gig.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg mb-1">{gig.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {gig.seller?.displayName}</p>
                <p className="text-sm text-gray-700">Package: {pkg.title}</p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-xl font-bold">Project Requirements</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Help the freelancer understand your needs:</strong> Provide clear details, 
                links, examples, and any reference images to ensure the best results.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Requirements *
                </label>
                <textarea
                  rows={6}
                  value={requirements}
                  onChange={(e) => {
                    setRequirements(e.target.value);
                    if (e.target.value.trim()) setCurrentStep(2);
                  }}
                  className="input-field"
                  placeholder="Example: I need a logo for my coffee shop. The style should be modern and minimalist. Colors: Brown and cream. Please include both text and icon versions..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about what you want, preferred style, colors, dimensions, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Images (Optional - Max 5)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="requirement-images"
                  />
                  <label htmlFor="requirement-images" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload reference images
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 10MB each (Max 5 images)
                    </p>
                  </label>
                </div>

                {requirementImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {requirementImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Payment Instructions</h2>
                <p className="text-blue-800 text-sm">
                  Follow these steps carefully to complete your payment securely
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1: Escrow Account */}
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <h3 className="font-bold text-gray-900">Send Payment To</h3>
                </div>
                <div className="ml-8">
                  <label className="text-sm text-gray-600 block mb-1">Escrow Account:</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-lg flex-1">
                      {escrowAccount}
                    </code>
                    <button
                      onClick={() => copyToClipboard(escrowAccount)}
                      className="btn-outline p-2"
                      title="Copy account"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Amount */}
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="font-bold text-gray-900">Amount</h3>
                </div>
                <div className="ml-8">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-2xl font-bold text-primary-600">
                      {amount} HIVE
                    </code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Send exactly this amount</p>
                </div>
              </div>

              {/* Step 3: Memo */}
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="font-bold text-gray-900">Memo (IMPORTANT)</h3>
                </div>
                <div className="ml-8">
                  <label className="text-sm text-gray-600 block mb-1">
                    Copy this unique memo - Required for verification:
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="bg-yellow-100 px-3 py-2 rounded font-mono text-sm flex-1 border-2 border-yellow-400">
                      {memo}
                    </code>
                    <button
                      onClick={() => copyToClipboard(memo)}
                      className="btn-outline p-2"
                      title="Copy memo"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Important:</strong> You MUST include this exact memo in your transaction. 
                        This is how we verify your payment. Without it, your order cannot be processed.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Transaction ID */}
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="font-bold text-gray-900">After Payment</h3>
                </div>
                <div className="ml-8">
                  <label className="text-sm text-gray-600 block mb-1">
                    Paste your transaction ID here:
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="input-field"
                    placeholder="e.g., abc123def456..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this on Hive Block Explorer after sending payment
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border-2 border-green-200">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>
                  Once you submit, we'll verify your transaction on the blockchain. 
                  This usually takes a few seconds. Your order will be created only after successful verification.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Package</span>
                <span className="font-semibold capitalize">{selectedPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Time</span>
                <span>{pkg.deliveryTime} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revisions</span>
                <span>{pkg.revisions}</span>
              </div>
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Price</span>
                  <span className="font-semibold">{pkg.price} HIVE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platform Fee ({feeBreakdown.feePercentage}%)</span>
                  <span className="text-gray-500">-{feeBreakdown.platformFee} HIVE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seller Receives</span>
                  <span className="text-green-600 font-medium">{feeBreakdown.sellerEarnings} HIVE</span>
                </div>
              </div>
              
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">You Pay</span>
                <span className="font-bold text-2xl text-primary-600">{pkg.price} HIVE</span>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <strong>Note:</strong> Platform fee is deducted from the total amount. You only pay {pkg.price} HIVE.
              </div>
            </div>

            <button
              onClick={() => createOrderMutation.mutate()}
              disabled={!requirements || !transactionId || verifying}
              className="btn-primary w-full mt-6"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying Transaction...
                </span>
              ) : (
                'Confirm & Place Order'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              By placing this order, you agree to our Terms of Service
            </p>
          </div>

          {/* Security Info */}
          <div className="card bg-green-50 border border-green-200">
            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Secure Payment
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ Escrow protection</li>
              <li>✓ Blockchain verification</li>
              <li>✓ Unique memo system</li>
              <li>✓ No double-spending</li>
              <li>✓ Instant confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
