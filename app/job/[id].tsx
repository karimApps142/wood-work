import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatCurrencyPKR } from '../../helper';
import { useStore } from '../../store/useStore';
import { Door, Job, PriceTemplate } from '../../types';

// --- NEW IMPORTS ---
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Helper component for compact, labeled inputs
const FormInput = ({ label, value, onChangeText }: { label: string, value: string, onChangeText: (text: string) => void }) => (
  <View className="w-[48%] mb-3">
    <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg p-3"
      placeholder="0"
    />
  </View>
);


export default function ManageJobScreen() {
  const router = useRouter();


  const { id } = useLocalSearchParams<{ id: string }>();
  const isCreatingNew = id === 'new';

  // --- Get entire store state and actions ---
  const { jobs, customers, templates, addJob, updateJob, deleteJob, brandName, companyInfo, logo } = useStore();

  // Find the job to edit based on the ID from the URL
  const jobToEdit = useMemo(() => isCreatingNew ? null : jobs.find(j => j.id === Number(id)), [id, jobs, isCreatingNew]);


  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState({ door: 300, beading: 100, frame: 50, paling: 50, polish: 100 });
  const [doors, setDoors] = useState<Partial<Door>[]>([{ area: 0, beading: 0, frame: 0, paling: 0, polish: 0 }]);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- CUSTOMER SELECTION STATE ---
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Derived state to find the full customer object
  const selectedCustomer = useMemo(() =>
    customers.find(c => c.id === selectedCustomerId),
    [customers, selectedCustomerId]);


  // Derived state for the filtered customer list in the modal
  const filteredCustomers = useMemo(() =>
    customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())),
    [customers, customerSearch]);


  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title.startsWith("Untitled Job") ? "" : jobToEdit.title);
      setNotes(jobToEdit.notes);
      setDoors(jobToEdit.doors);
      setSelectedCustomerId(jobToEdit.customerId);
      // Note: We don't load prices, as prices are job-specific. 
      // The user can re-apply a template if needed.
    }
  }, [jobToEdit]);
  const applyTemplate = (template: PriceTemplate) => {
    Alert.alert("Apply Template", `Are you sure you want to apply the "${template.name}" prices? This will override current price settings.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Apply", onPress: () => { setPrice(template); setSelectedTemplateName(template.name); } }
    ]);
  };

  const handlePriceChange = (field: keyof typeof price, value: string) => {
    setSelectedTemplateName(null);
    setPrice(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };


  const handleDoorChange = (index: number, field: keyof Door, value: string) => {
    const newDoors = [...doors];
    // Create a mutable copy of the specific door object we're updating
    const doorToUpdate = { ...newDoors[index] };

    // 1. Update the measurement value (e.g., area, beading)
    (doorToUpdate as any)[field] = parseFloat(value) || 0;

    // 2. Determine the corresponding key in the main `price` state.
    // This handles the special case where the door's "area" corresponds to the price state's "door".
    const priceSourceKey = field === 'area' ? 'door' : field;

    // 3. Construct the key for storing the price within the door object (e.g., "areaPrice").
    const priceStorageKey = `${field}Price`;

    // 4. Get the current price from the main price state and store it in the door object.
    // The `if` check ensures we only try to access valid keys of the price object.
    if (priceSourceKey in price) {
      (doorToUpdate as any)[priceStorageKey] = (price as any)[priceSourceKey];
    }

    // 5. Replace the old door object with our updated one.
    newDoors[index] = doorToUpdate;

    // 6. Set the new state.
    setDoors(newDoors);
  };


  const addDoor = () => setDoors([...doors, { area: 0, beading: 0, frame: 0, paling: 0, polish: 0 }]);

  const removeDoor = (index: number) => {
    if (doors.length > 1) {
      setDoors(doors.filter((_, i) => i !== index));
    } else {
      Toast.show({
        type: 'info',
        text1: 'Cannot Remove',
        text2: 'You must have at least one door in a job.'
      })
    }
  };

  const grandTotal = useMemo(() => {
    return doors.reduce((total, door) => {
      const doorSubtotal = (door.area || 0) * price.door + (door.beading || 0) * price.beading + (door.frame || 0) * price.frame + (door.paling || 0) * price.paling + (door.polish || 0) * price.polish;
      return total + doorSubtotal;
    }, 0);
  }, [doors, price]);

  const handleSave = async () => {
    const isAnyDoorFieldFilled = doors.some(door =>
      (door.area || 0) > 0 || (door.beading || 0) > 0 || (door.frame || 0) > 0 || (door.paling || 0) > 0 || (door.polish || 0) > 0
    );

    if (!isAnyDoorFieldFilled) {
      Toast.show({
        type: 'info',
        text1: 'Cannot Save"',
        text2: 'Please add at least one measurement (e.g., Area, Beading) to a door before saving.'
      })
      return;
    }

    setIsSaving(true);
    try {
      const finalTitle = title.trim() || `Untitled Job ${new Date().toLocaleDateString()}`;

      // --- CONSTRUCT THE NEW JOB OBJECT ---
      const jobData: Job = {
        id: isCreatingNew ? Date.now() : jobToEdit!.id, // Use existing ID if editing
        title: finalTitle,
        notes,
        date: isCreatingNew ? new Date().toISOString() : jobToEdit!.date,
        grandTotal,
        customerId: selectedCustomerId,
        doors: doors.map((d, index) => ({ // Map the state doors to the final door objects
          id: index,
          area: d.area || 0,
          beading: d.beading || 0,
          frame: d.frame || 0,
          paling: d.paling || 0,
          polish: d.polish || 0,
          subtotal: (d.area || 0) * price.door + (d.beading || 0) * price.beading + (d.frame || 0) * price.frame + (d.paling || 0) * price.paling + (d.polish || 0) * price.polish,
          // Also save the prices used for the calculation
          areaPrice: d.areaPrice ?? price.door,
          beadingPrice: d.beadingPrice ?? price.beading,
          framePrice: d.framePrice ?? price.frame,
          palingPrice: d.palingPrice ?? price.paling,
          polishPrice: d.polishPrice ?? price.polish,
        })),
      };

      if (isCreatingNew) {
        addJob(jobData);
      } else {
        updateJob(jobData);
      }

      Toast.show({
        type: 'success',
        text1: 'Success"',
        text2: `Job has been ${isCreatingNew ? 'saved' : 'updated'}.`
      })
      router.navigate('/(tabs)')

    } catch (error) {
      console.error("Failed to save job:", error);
      Toast.show({
        type: 'error',
        text1: 'Error"',
        text2: 'There was a problem saving the job. Please try again.'
      })
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = () => {
    if (!jobToEdit) return;

    // Show a confirmation dialog before deleting
    Alert.alert(
      "Delete Job?",
      "Are you sure you want to permanently delete this job? This action cannot be undone.",
      [
        // The "Cancel" button does nothing.
        {
          text: "Cancel",
          style: "cancel",
        },
        // The "Delete" button calls the store action and navigates back.
        {
          text: "Delete",
          onPress: () => {
            deleteJob(jobToEdit.id);
            router.back();
          },
          style: "destructive", // This makes the button red on iOS.
        },
      ]
    );
  };

  const handleExportPdf = async () => {
    if (!jobToEdit) return;

    // --- Step 1: Handle the logo (convert to base64) ---
    let logoBase64 = null;
    if (logo) {
      try {
        logoBase64 = await FileSystem.readAsStringAsync(logo, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (e) {
        console.error("Could not read logo file for PDF.", e);
      }
    }
    const logoHtml = logoBase64
      ? `<img src="data:image/jpeg;base64,${logoBase64}" style="width: 80px; height: 80px; border-radius: 40px;" />`
      : "";

    // --- Step 2: Generate the detailed HTML for each door's cost breakdown ---
    const doorsHtml = jobToEdit.doors
      .map((door, index) => {
        const costItems = [
          door.area > 0 &&
          `<tr><td>Area (${door.area} sq ft)</td><td>@ ${formatCurrencyPKR(
            door.areaPrice
          )}/sq ft</td><td><strong>${formatCurrencyPKR(
            door.area * door.areaPrice
          )}</strong></td></tr>`,
          door.beading > 0 &&
          `<tr><td>Beading (${door.beading} ft)</td><td>@ ${formatCurrencyPKR(
            door.beadingPrice
          )}/ft</td><td><strong>${formatCurrencyPKR(
            door.beading * door.beadingPrice
          )}</strong></td></tr>`,
          door.frame > 0 &&
          `<tr><td>Frame (${door.frame} ft)</td><td>@ ${formatCurrencyPKR(
            door.framePrice
          )}/ft</td><td><strong>${formatCurrencyPKR(
            door.frame * door.framePrice
          )}</strong></td></tr>`,
          door.paling > 0 &&
          `<tr><td>Paling (${door.paling} ft)</td><td>@ ${formatCurrencyPKR(
            door.palingPrice
          )}/ft</td><td><strong>${formatCurrencyPKR(
            door.paling * door.palingPrice
          )}</strong></td></tr>`,
          door.polish > 0 &&
          `<tr><td>Polish (${door.polish} sq ft)</td><td>@ ${formatCurrencyPKR(
            door.polishPrice
          )}/sq ft</td><td><strong>${formatCurrencyPKR(
            door.polish * door.polishPrice
          )}</strong></td></tr>`,
        ]
          .filter(Boolean)
          .join("");

        return `
        <tr>
          <td class="door-index"><strong>Door #${index + 1}</strong></td>
          <td>
            <table class="inner-table">
              <thead><tr><th>Item</th><th>Rate</th><th>Total</th></tr></thead>
              <tbody>${costItems}</tbody>
            </table>
          </td>
          <td class="subtotal">${formatCurrencyPKR(door.subtotal)}</td>
        </tr>`;
      })
      .join("");

    const customerHtml = selectedCustomer
      ? `<p><strong>${selectedCustomer.name}</strong><br>${selectedCustomer.address || ""}<br>${selectedCustomer.phone || ""}</p>`
      : `<p>Valued Customer</p>`;

    // --- Step 3: Assemble the final professional HTML document ---
    const html = `
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 0; }
        .container { padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #005A9C; }
        .company-details { max-width: 60%; }
        .company-name { font-size: 28px; font-weight: bold; color: #005A9C; margin-bottom: 5px; }
        .company-info { white-space: pre-wrap; color: #555; }
        .invoice-details { text-align: right; }
        .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin-top: 30px; }
        .section-title { font-size: 16px; font-weight: bold; color: #005A9C; padding-bottom: 5px; border-bottom: 1px solid #eee; margin-bottom: 15px; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { padding: 10px; border-bottom: 1px solid #eee; text-align: left; vertical-align: top; }
        .items-table th { background-color: #f9f9f9; font-weight: bold; }
        .items-table .door-index { width: 20%; }
        .items-table .subtotal { width: 20%; text-align: right; font-weight: bold; }
        .inner-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 5px; }
        .inner-table th, .inner-table td { border: 1px solid #ddd; padding: 4px; text-align: left; }
        .totals { margin-top: 20px; float: right; width: 40%; }
        .totals-table { width: 100%; }
        .totals-table td { padding: 8px; }
        .grand-total { font-size: 18px; font-weight: bold; color: #005A9C; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; padding: 10px; font-size: 10px; color: #888; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-details">
            ${logoHtml}
            <div class="company-name">${brandName}</div>
            <div class="company-info">${companyInfo}</div>
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <p><strong>Job Title:</strong> ${jobToEdit.title}</p>
            <p><strong>Date:</strong> ${new Date(jobToEdit.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Bill To</div>
          ${customerHtml}
        </div>

        <div class="section">
          <div class="section-title">Work Summary</div>
          <table class="items-table">
            <thead><tr><th>Door</th><th>Cost Breakdown</th><th style="text-align: right;">Subtotal</th></tr></thead>
            <tbody>${doorsHtml}</tbody>
          </table>
        </div>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td><strong>Grand Total</strong></td>
              <td class="grand-total" style="text-align: right;">${formatCurrencyPKR(jobToEdit.grandTotal)}</td>
            </tr>
          </table>
        </div>

        ${jobToEdit.notes ? `<div class="section"><div class="section-title">Notes</div><p>${jobToEdit.notes}</p></div>` : ""}

        <div class="footer">Thank you for your business!</div>
      </div>
    </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612,
        height: 792,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Invoice",
      });
    } catch (error) {
      /* ... error handling ... */
    }
  };




  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled" className="p-4">
          <Card>
            <Text className="text-lg font-bold mb-2 dark:text-white">Job Details (Optional)</Text>
            {/* --- SIMPLIFIED CUSTOMER SELECTION UI --- */}
            <View className="mb-2">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Customer</Text>
              <TouchableOpacity onPress={() => setCustomerModalVisible(true)} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 flex-row justify-between items-center">
                <Text className={selectedCustomer ? "dark:text-white" : "text-gray-500"}>
                  {selectedCustomer?.name ?? 'Select a Customer'}
                </Text>
                <Feather name="users" size={18} className="text-gray-500" />
              </TouchableOpacity>
            </View>
            <TextInput placeholder="Job Title (e.g., 'Kitchen Cabinets')" value={title} onChangeText={setTitle} className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg p-3 mb-2" />
            <TextInput placeholder="Notes" value={notes} onChangeText={setNotes} multiline className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg p-3 h-20" />
          </Card>

          <Card>
            <Text className="text-lg font-bold mb-3 dark:text-white">Price Settings</Text>
            <View className="flex-row flex-wrap mb-3">
              {templates.map(template => {
                const isSelected = template.name === selectedTemplateName;
                return (
                  <TouchableOpacity key={template.name} onPress={() => applyTemplate(template)} className={`${isSelected ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-900'} rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text className={`${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-300'} font-semibold`}>{template.name}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <View className="flex-row flex-wrap justify-between">
              <FormInput label="Door (sq ft)" value={String(price.door)} onChangeText={(val) => handlePriceChange('door', val)} />
              <FormInput label="Beading (ft)" value={String(price.beading)} onChangeText={(val) => handlePriceChange('beading', val)} />
              <FormInput label="Frame (ft)" value={String(price.frame)} onChangeText={(val) => handlePriceChange('frame', val)} />
              <FormInput label="Paling (ft)" value={String(price.paling)} onChangeText={(val) => handlePriceChange('paling', val)} />
              <FormInput label="Polish (sq ft)" value={String(price.polish)} onChangeText={(val) => handlePriceChange('polish', val)} />
            </View>
          </Card>

          {doors.map((door, index) => {
            const subtotal = (door.area || 0) * price.door + (door.beading || 0) * price.beading + (door.frame || 0) * price.frame + (door.paling || 0) * price.paling + (door.polish || 0) * price.polish;
            return (
              <Card key={index}>
                <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
                  <Text className="text-lg font-bold dark:text-white">Door #{index + 1}</Text>
                  <TouchableOpacity onPress={() => removeDoor(index)}><Feather name="trash-2" size={20} color="#ef4444" /></TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap justify-between">
                  <FormInput label="Area (sq ft)" value={String(door.area || '')} onChangeText={(val) => handleDoorChange(index, 'area', val)} />
                  <FormInput label="Beading (ft)" value={String(door.beading || '')} onChangeText={(val) => handleDoorChange(index, 'beading', val)} />
                  <FormInput label="Frame (ft)" value={String(door.frame || '')} onChangeText={(val) => handleDoorChange(index, 'frame', val)} />
                  <FormInput label="Paling (ft)" value={String(door.paling || '')} onChangeText={(val) => handleDoorChange(index, 'paling', val)} />
                  <FormInput label="Polish (sq ft)" value={String(door.polish || '')} onChangeText={(val) => handleDoorChange(index, 'polish', val)} />
                </View>
                <Text className="text-right font-bold mt-2 text-base dark:text-gray-300">Subtotal: {formatCurrencyPKR(subtotal)}</Text>
              </Card>
            )
          })}
          <TouchableOpacity className="border-2 border-dashed border-blue-500 rounded-lg p-4 items-center mb-4" onPress={addDoor}>
            <Text className="text-blue-500 font-bold text-base">+ Add Another Door</Text>
          </TouchableOpacity>
        </ScrollView>
        <View className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-600 dark:text-gray-400">Grand Total</Text>
            <Text className="text-2xl font-bold dark:text-white">{formatCurrencyPKR(grandTotal)}</Text>
          </View>
          <Button title={isSaving ? "Saving..." : "Save Job"} onPress={handleSave} disabled={isSaving} />
          {!isCreatingNew && <Button title="Export as PDF" onPress={handleExportPdf} variant="secondary" />}
          {!isCreatingNew && (
            <TouchableOpacity
              onPress={handleDeleteJob}
              className="mt-3 p-3 rounded-lg"
            >
              <Text className="text-center font-bold text-red-500">Delete Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={customerModalVisible}
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-2xl p-4 h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold dark:text-white">Select a Customer</Text>
              <TouchableOpacity onPress={() => setCustomerModalVisible(false)}>
                <Feather name="x" size={24} className="text-gray-500" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search existing customers..."
              value={customerSearch}
              onChangeText={setCustomerSearch}
              className="bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg p-3 mb-3"
            />
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setSelectedCustomerId(item.id); setCustomerModalVisible(false); }}
                  className="p-4 border-b border-gray-100 dark:border-gray-700"
                >
                  <Text className="text-lg dark:text-white">{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center mt-8">
                  <Text className="text-center text-gray-500">No customers found.</Text>
                  <Text className="text-center text-gray-500 text-sm mt-1">Add one from the &apos;Customers&apos; tab.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}