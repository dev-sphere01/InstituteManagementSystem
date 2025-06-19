/**
 * Swagger definitions for admission-related endpoints
 */

const paths = {
  '/api/v1/admissions': {
    post: {
      summary: 'Create a new admission',
      tags: ['Admission'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdmissionInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Admission created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Admission' }
            }
          }
        },
        400: { description: 'Validation error' },
        500: { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all admissions',
      tags: ['Admission'],
      responses: {
        200: {
          description: 'List of all admissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Admission' }
                  }
                }
              }
            }
          }
        },
        500: { description: 'Server error' }
      }
    }
  },
  '/api/v1/admissions/{id}': {
    get: {
      summary: 'Get admission by ID',
      tags: ['Admission'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: { type: 'string' },
          required: true,
          description: 'Admission ID'
        }
      ],
      responses: {
        200: {
          description: 'Admission found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Admission' }
            }
          }
        },
        404: { description: 'Admission not found' },
        500: { description: 'Server error' }
      }
    },
    put: {
      summary: 'Update admission by ID',
      tags: ['Admission'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: { type: 'string' },
          required: true,
          description: 'Admission ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdmissionInput' }
          }
        }
      },
      responses: {
        200: { description: 'Admission updated' },
        404: { description: 'Not found' },
        500: { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete admission by ID',
      tags: ['Admission'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: { type: 'string' },
          required: true,
          description: 'Admission ID'
        }
      ],
      responses: {
        200: { description: 'Deleted successfully' },
        404: { description: 'Not found' },
        500: { description: 'Server error' }
      }
    }
  }
};

const schemas = {
  Admission: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      formNo: { type: 'string' },
      centerCode: { type: 'string' },
      employeeId: { type: 'string' },
      otherInfo: { type: 'string' },
      generatedRegNo: { type: 'string' },
      fullName: { type: 'string' },
      dob: { type: 'string', format: 'date' },
      gender: { type: 'string' },
      category: { type: 'string' },
      aadharNo: { type: 'string' },
      religion: { type: 'string' },
      contactNumber: { type: 'string' },
      emailAddress: { type: 'string' },
      state: { type: 'string' },
      district: { type: 'string' },
      address: { type: 'string' },
      pinCode: { type: 'string' },
      fathersName: { type: 'string' },
      mothersName: { type: 'string' },
      highestEducationalQualification: { type: 'string' },
      boardOrUniversity: { type: 'string' },
      yearOfPassing: { type: 'string' },
      subjectsStudied: { type: 'string' },
      courseApplied: { type: 'string' },
      preferredModeOfLearning: { type: 'string' },
      regNo: { type: 'string' },
      month: { type: 'string' },
      status: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  AdmissionInput: {
    type: 'object',
    required: [
      'formNo', 'centerCode', 'employeeId', 'generatedRegNo', 'fullName',
      'dob', 'gender', 'category', 'aadharNo', 'religion', 'contactNumber',
      'emailAddress', 'state', 'district', 'address', 'pinCode',
      'fathersName', 'mothersName', 'highestEducationalQualification',
      'boardOrUniversity', 'yearOfPassing', 'subjectsStudied',
      'courseApplied', 'preferredModeOfLearning', 'regNo', 'month'
    ],
    properties: {
      formNo: { type: 'string' },
      centerCode: { type: 'string' },
      employeeId: { type: 'string' },
      otherInfo: { type: 'string' },
      generatedRegNo: { type: 'string' },
      fullName: { type: 'string' },
      dob: { type: 'string', format: 'date' },
      gender: { type: 'string' },
      category: { type: 'string' },
      aadharNo: { type: 'string' },
      religion: { type: 'string' },
      contactNumber: { type: 'string' },
      alternateContactNumber: { type: 'string' },
      emailAddress: { type: 'string' },
      state: { type: 'string' },
      district: { type: 'string' },
      address: { type: 'string' },
      pinCode: { type: 'string' },
      fathersName: { type: 'string' },
      fathersOccupation: { type: 'string' },
      mothersName: { type: 'string' },
      guardianName: { type: 'string' },
      highestEducationalQualification: { type: 'string' },
      boardOrUniversity: { type: 'string' },
      yearOfPassing: { type: 'string' },
      subjectsStudied: { type: 'string' },
      courseApplied: { type: 'string' },
      preferredModeOfLearning: { type: 'string' },
      regNo: { type: 'string' },
      month: { type: 'string' }
    }
  }
};

module.exports = {
  paths,
  schemas
};
