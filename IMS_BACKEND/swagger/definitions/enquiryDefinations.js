/**
 * Swagger definitions for enquiry-related endpoints
 */

const paths = {
  '/api/v1/enquiry': {
    post: {
      summary: 'Create a new enquiry',
      tags: ['Enquiry'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EnquiryInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Enquiry created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Enquiry' }
            }
          }
        },
        422: { description: 'Validation error' },
        500: { description: 'Server error' }
      }
    },
    get: {
      summary: 'Get all enquiries',
      tags: ['Enquiry'],
      responses: {
        200: {
          description: 'List of enquiries',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Enquiry' }
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
  '/api/v1/enquiry/{id}': {
    get: {
      summary: 'Get enquiry by ID',
      tags: ['Enquiry'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: { type: 'string' },
          required: true,
          description: 'Enquiry ID'
        }
      ],
      responses: {
        200: {
          description: 'Enquiry found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Enquiry' }
            }
          }
        },
        404: { description: 'Not found' },
        500: { description: 'Server error' }
      }
    },
    delete: {
      summary: 'Delete enquiry by ID',
      tags: ['Enquiry'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: { type: 'string' },
          required: true,
          description: 'Enquiry ID'
        }
      ],
      responses: {
        204: { description: 'Deleted' },
        404: { description: 'Not found' },
        500: { description: 'Server error' }
      }
    }
  }
};

const schemas = {
  Enquiry: {
    type: 'object',
    properties: {
      _id: { type: 'string', description: 'Enquiry ID' },
      registrationInfo: {
        type: 'object',
        properties: {
          centerCode: { type: 'string' },
          employeeId: { type: 'string' },
          otherInfo: { type: 'string' }
        }
      },
      personalInfo: {
        type: 'object',
        properties: {
          fullName: { type: 'string' },
          dob: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
          category: { type: 'string', enum: ['GEN', 'OBC', 'ST', 'SC', 'OTHER'] },
          exServicemen: { type: 'boolean' },
          speciallyAbled: { type: 'boolean' }
        }
      },
      contactInfo: {
        type: 'object',
        properties: {
          contactNumber: { type: 'string' },
          alternateContactNumber: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          pinCode: { type: 'string' }
        }
      },
      educationInfo: {
        type: 'object',
        properties: {
          qualification: { type: 'string' },
          boardId: { type: 'string' },
          universityId: { type: 'string' },
          yearOfPassing: { type: 'number' },
          subjectIds: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      coursePreferences: {
        type: 'object',
        properties: {
          interestedCourses: {
            type: 'array',
            items: { type: 'string' }
          },
          mode: { type: 'string', enum: ['online', 'offline'] },
          courseLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }
        }
      },
      schedulePreferences: {
        type: 'object',
        properties: {
          preferredBatchTime: { type: 'string' }
        }
      },
      referralInfo: {
        type: 'object',
        properties: {
          referralSource: { type: 'string', enum: ['friend', 'institution', 'other'] },
          sourceName: { type: 'string' },
          referralCode: { type: 'string' }
        }
      },
      goalsRequirements: {
        type: 'object',
        properties: {
          courseGoal: { type: 'string' },
          futureGoals: {
            type: 'array',
            items: { type: 'string' }
          },
          hasComputerAccess: { type: 'string', enum: ['yes', 'no'] }
        }
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  EnquiryInput: {
    type: 'object',
    required: ['registrationInfo', 'personalInfo', 'contactInfo'],
    properties: {
      registrationInfo: {
        type: 'object',
        required: ['centerCode', 'employeeId'],
        properties: {
          centerCode: { type: 'string' },
          employeeId: { type: 'string' },
          otherInfo: { type: 'string' }
        }
      },
      personalInfo: {
        type: 'object',
        required: ['fullName'],
        properties: {
          fullName: { type: 'string' },
          dob: { type: 'string', format: 'date' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
          category: { type: 'string', enum: ['GEN', 'OBC', 'ST', 'SC', 'OTHER'] },
          exServicemen: { type: 'boolean' },
          speciallyAbled: { type: 'boolean' }
        }
      },
      contactInfo: {
        type: 'object',
        required: ['contactNumber', 'email'],
        properties: {
          contactNumber: { type: 'string' },
          alternateContactNumber: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          pinCode: { type: 'string' }
        }
      },
      educationInfo: {
        type: 'object',
        properties: {
          qualification: { type: 'string' },
          boardId: { type: 'string' },
          universityId: { type: 'string' },
          yearOfPassing: { type: 'number' },
          subjectIds: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      coursePreferences: {
        type: 'object',
        properties: {
          interestedCourses: {
            type: 'array',
            items: { type: 'string' }
          },
          mode: { type: 'string', enum: ['online', 'offline'] },
          courseLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }
        }
      },
      schedulePreferences: {
        type: 'object',
        properties: {
          preferredBatchTime: { type: 'string' }
        }
      },
      referralInfo: {
        type: 'object',
        properties: {
          referralSource: { type: 'string', enum: ['friend', 'institution', 'other'] },
          sourceName: { type: 'string' },
          referralCode: { type: 'string' }
        }
      },
      goalsRequirements: {
        type: 'object',
        properties: {
          courseGoal: { type: 'string' },
          futureGoals: {
            type: 'array',
            items: { type: 'string' }
          },
          hasComputerAccess: { type: 'string', enum: ['yes', 'no'] }
        }
      }
    }
  }
};

module.exports = {
  paths,
  schemas
};
