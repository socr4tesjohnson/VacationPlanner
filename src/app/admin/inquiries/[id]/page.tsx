"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageId: string | null;
  packageTitle: string | null;
  startDate: string | null;
  endDate: string | null;
  flexible: boolean;
  adults: number;
  children: number;
  budgetRange: string | null;
  message: string;
  status: string;
  notes: string | null;
  quotedAmount: number | null;
  commissionRate: number | null;
  commissionAmount: number | null;
  checklist: string | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CHECKLIST_ITEMS = [
  { id: '1', text: 'Travel insurance discussed', completed: false },
  { id: '2', text: 'Dining plan preferences', completed: false },
  { id: '3', text: 'Park tickets included', completed: false },
  { id: '4', text: 'Hotel preferences confirmed', completed: false },
  { id: '5', text: 'Transportation needs (airport, parks)', completed: false },
  { id: '6', text: 'Special occasions (birthday, anniversary)', completed: false },
  { id: '7', text: 'Dietary restrictions noted', completed: false },
  { id: '8', text: 'Character dining reservations', completed: false },
  { id: '9', text: 'Genie+ / Lightning Lane discussed', completed: false },
  { id: '10', text: 'Payment schedule confirmed', completed: false },
];

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [quotedAmount, setQuotedAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST_ITEMS);

  useEffect(() => {
    const token = localStorage.getItem("session_token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchInquiry();
  }, [params.id, router]);

  const fetchInquiry = async () => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/inquiries/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("session_token");
        router.push("/login");
        return;
      }

      const data = await response.json();
      setInquiry(data.inquiry);

      // Load saved data into form fields
      setNotes(data.inquiry.notes || "");
      setQuotedAmount(data.inquiry.quotedAmount?.toString() || "");
      setCommissionRate(data.inquiry.commissionRate?.toString() || "10");

      // Load checklist from JSON or use default
      if (data.inquiry.checklist) {
        try {
          setChecklist(JSON.parse(data.inquiry.checklist));
        } catch {
          setChecklist(DEFAULT_CHECKLIST_ITEMS);
        }
      }
    } catch (err) {
      setError("Failed to load inquiry");
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!inquiry) return;

    try {
      const token = localStorage.getItem("session_token");
      await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      setError("Failed to save notes");
    }
  };

  const saveQuote = async () => {
    if (!inquiry) return;

    const quoted = parseFloat(quotedAmount) || 0;
    const rate = parseFloat(commissionRate) || 10;
    const commission = (quoted * rate) / 100;

    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotedAmount: quoted,
          commissionRate: rate,
          commissionAmount: commission
        }),
      });

      if (response.ok) {
        setInquiry({
          ...inquiry,
          quotedAmount: quoted,
          commissionRate: rate,
          commissionAmount: commission
        });
      }
    } catch (err) {
      setError("Failed to save quote");
    }
  };

  const saveChecklist = async (updatedChecklist: ChecklistItem[]) => {
    if (!inquiry) return;

    try {
      const token = localStorage.getItem("session_token");
      await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checklist: JSON.stringify(updatedChecklist) }),
      });
    } catch (err) {
      setError("Failed to save checklist");
    }
  };

  const toggleChecklistItem = (id: string) => {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    saveChecklist(updated);
  };

  const updateStatus = async (newStatus: string) => {
    if (!inquiry) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch(`/api/admin/inquiries/${params.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setInquiry({ ...inquiry, status: newStatus });
      } else {
        setError("Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiry...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inquiry not found
          </h2>
          <Link
            href="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Inquiry Details
              </h1>
              <p className="text-gray-600">ID: {inquiry.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Status Update */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Update Status
          </h2>
          <div className="flex gap-3 flex-wrap">
            {["new", "contacted", "quoted", "booked", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                disabled={updating || inquiry.status === status}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  inquiry.status === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.firstName} {inquiry.lastName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-base text-blue-600 hover:text-blue-800"
                >
                  {inquiry.email}
                </a>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="text-base text-blue-600 hover:text-blue-800"
                >
                  {inquiry.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Trip Details
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Travel Dates</div>
                <div className="text-base font-medium text-gray-900">
                  {formatDate(inquiry.startDate)}
                </div>
                <div className="text-base font-medium text-gray-900">
                  to {formatDate(inquiry.endDate)}
                </div>
                {inquiry.flexible && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Dates are flexible
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Party Size</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.adults} adult(s), {inquiry.children} child(ren)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Budget Range</div>
                <div className="text-base font-medium text-gray-900">
                  {inquiry.budgetRange || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Interest */}
        {inquiry.packageTitle && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Interested Package
            </h2>
            <div className="text-base text-gray-900">{inquiry.packageTitle}</div>
          </div>
        )}

        {/* Message */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Message
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        </div>

        {/* Quote & Commission Tracker */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 Quote & Commission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quoted Amount ($)
              </label>
              <input
                type="number"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Commission
              </label>
              <div className="w-full px-3 py-2 bg-green-50 border-2 border-green-500 rounded-lg font-bold text-green-700 text-lg">
                ${((parseFloat(quotedAmount) || 0) * (parseFloat(commissionRate) || 0) / 100).toFixed(2)}
              </div>
            </div>
          </div>
          <button
            onClick={saveQuote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Save Quote & Commission
          </button>
        </div>

        {/* Client Checklist */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✅ Client Checklist</h2>
          <p className="text-sm text-gray-600 mb-4">Track what you&apos;ve discussed with the client</p>
          <div className="space-y-2">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`ml-3 text-gray-700 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Completed: {checklist.filter(item => item.completed).length} / {checklist.length}
          </div>
        </div>

        {/* Private Notes */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Private Notes</h2>
          <p className="text-sm text-gray-600 mb-3">Only you can see these notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add your private notes about this client, conversation highlights, special requests, etc..."
          />
          <div className="text-xs text-gray-500 mt-2">Auto-saves when you click away</div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inquiry Metadata
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Submitted</div>
              <div className="font-medium text-gray-900">
                {new Date(inquiry.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Last Updated</div>
              <div className="font-medium text-gray-900">
                {new Date(inquiry.updatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
