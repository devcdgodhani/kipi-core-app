import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/widgets/kipi_button.dart';
import '../../../theme/app_text_styles.dart';
import '../domain/address_models.dart';
import '../providers/address_provider.dart';

class AddEditAddressScreen extends ConsumerStatefulWidget {
  final Address? address;

  const AddEditAddressScreen({this.address, super.key});

  @override
  ConsumerState<AddEditAddressScreen> createState() => _AddEditAddressScreenState();
}

class _AddEditAddressScreenState extends ConsumerState<AddEditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _nameController;
  late TextEditingController _mobileController;
  late TextEditingController _pincodeController;
  late TextEditingController _addressLine1Controller;
  late TextEditingController _addressLine2Controller;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  String _selectedType = 'HOME';
  
  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.address?.name);
    _mobileController = TextEditingController(text: widget.address?.mobile);
    _pincodeController = TextEditingController(text: widget.address?.pincode);
    _addressLine1Controller = TextEditingController(text: widget.address?.addressLine1);
    _addressLine2Controller = TextEditingController(text: widget.address?.addressLine2);
    _cityController = TextEditingController(text: widget.address?.city);
    _stateController = TextEditingController(text: widget.address?.state);
    if (widget.address != null) {
      _selectedType = widget.address!.type;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    _pincodeController.dispose();
    _addressLine1Controller.dispose();
    _addressLine2Controller.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.address == null ? 'Add Address' : 'Edit Address'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _mobileController,
              decoration: const InputDecoration(labelText: 'Mobile Number'),
              keyboardType: TextInputType.phone,
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _pincodeController,
                    decoration: const InputDecoration(labelText: 'Pincode'),
                    keyboardType: TextInputType.number,
                    validator: (v) => v?.isEmpty == true ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _cityController,
                    decoration: const InputDecoration(labelText: 'City'),
                    validator: (v) => v?.isEmpty == true ? 'Required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _stateController,
              decoration: const InputDecoration(labelText: 'State'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressLine1Controller,
              decoration: const InputDecoration(labelText: 'Address Line 1 (House No, Building)'),
              validator: (v) => v?.isEmpty == true ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressLine2Controller,
              decoration: const InputDecoration(labelText: 'Address Line 2 (Road, Area)'),
            ),
            const SizedBox(height: 24),
            Text('Address Type', style: AppTextStyles.labelLarge),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildTypeChip('HOME'),
                const SizedBox(width: 12),
                _buildTypeChip('WORK'),
                const SizedBox(width: 12),
                _buildTypeChip('OTHER'),
              ],
            ),
            const SizedBox(height: 32),
            KipiButton(
              text: 'Save Address',
              onPressed: _saveAddress,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeChip(String type) {
    final isSelected = _selectedType == type;
    return ChoiceChip(
      label: Text(type),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedType = type;
          });
        }
      },
    );
  }

  void _saveAddress() async {
    if (_formKey.currentState!.validate()) {
      final address = Address(
        id: widget.address?.id,
        name: _nameController.text,
        mobile: _mobileController.text,
        pincode: _pincodeController.text,
        addressLine1: _addressLine1Controller.text,
        addressLine2: _addressLine2Controller.text,
        city: _cityController.text,
        state: _stateController.text,
        type: _selectedType,
        isDefault: widget.address?.isDefault ?? false,
      );

      try {
        if (widget.address == null) {
          await ref.read(addressNotifierProvider.notifier).addAddress(address);
        } else {
          await ref.read(addressNotifierProvider.notifier).updateAddress(address);
        }
        if (mounted) context.pop();
      } catch (e) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      }
    }
  }
}
