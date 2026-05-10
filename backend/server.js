const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const AuditLog =
  require('./models/AuditLog');

dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/healthcare_privacy';



// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());



// =====================================================
// FILE UPLOAD
// =====================================================

const upload = multer({
  dest: 'uploads/',
});



// =====================================================
// MONGODB SCHEMAS
// =====================================================

const encryptedPatientSchema =
  new mongoose.Schema({

    record_id: {
      type: String,
      unique: true
    },

    patient_id: String,

    encrypted_age: String,

    encrypted_gender: String,

    encrypted_disease: String,

    encrypted_blood_pressure: String,

    encrypted_risk_score: String,

    disease_category: String,

    upload_source: {

      type: String,

      default: 'manual'

    },

    timestamp: {

      type: Date,

      default: Date.now,

    },

  });



const computationResultSchema =
  new mongoose.Schema({

    result_id: String,

    function_type: String,

    computed_value:
      mongoose.Schema.Types.Mixed,

    generated_time: {

      type: Date,

      default: Date.now,

    },

  });



// =====================================================
// MODELS
// =====================================================

const EncryptedPatientData =
  mongoose.model(
    'EncryptedPatientData',
    encryptedPatientSchema
  );



const ComputationResult =
  mongoose.model(
    'ComputationResult',
    computationResultSchema
  );



// =====================================================
// HELPERS
// =====================================================

function generateRecordId() {

  return `REC_${Date.now()}_${Math.floor(
    Math.random() * 10000
  )}`;
}



// =====================================================
// HEALTH ROUTE
// =====================================================

app.get('/api/health', (req, res) => {

  res.json({

    status: 'ok',

    timestamp:
      new Date().toISOString(),

  });
});



// =====================================================
// ENCRYPT ROUTE
// =====================================================

app.post('/api/encrypt', async (req, res) => {

  try {

    const {

      patient_id,
      age,
      gender,
      disease,
      blood_pressure,
      risk_score,

    } = req.body;



    // =========================================
    // CALL PYTHON CRYPTO API
    // =========================================

    const cryptoResponse =
      await axios.post(

        'http://127.0.0.1:5001/encrypt',

        {

          age,
          gender,
          disease,
          blood_pressure,
          risk_score,

        }

      );



    const encrypted =
      cryptoResponse.data
        .encrypted_data;



    const record_id =
      generateRecordId();



    // =========================================
    // SAVE RECORD
    // =========================================

    const record =
      new EncryptedPatientData({

        record_id,

        patient_id,

        encrypted_age:
          encrypted.age,

        encrypted_gender:
          encrypted.gender,

        encrypted_disease:
          encrypted.disease,

        encrypted_blood_pressure:
          encrypted.blood_pressure,

        encrypted_risk_score:
          encrypted.risk_score,

        disease_category:
          disease,

        upload_source:
          'manual',

        timestamp:
          new Date(),

      });

    await record.save();



    // =========================================
    // AUDIT LOG
    // =========================================

    await AuditLog.create({

      action: 'ENCRYPT',

      user: 'admin',

      details:
        `Encrypted patient ${patient_id}`,

      status: 'success'

    });



    res.json({

      success: true,

      message:
        'Patient encrypted successfully',

      record_id,

      encrypted_data:
        encrypted,

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error:
        err.message,

    });
  }
});



// =====================================================
// BATCH CSV UPLOAD
// =====================================================

app.post(

  '/api/upload/batch',

  upload.single('file'),

  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            'No CSV file uploaded'

        });
      }



      const rows = [];



      fs.createReadStream(req.file.path)

        .pipe(csv())

        .on('data', (data) => {

          rows.push(data);

        })

        .on('end', async () => {

          try {

            let uploaded = 0;

            let failed = 0;

            const errors = [];



            // =====================================
            // PROCESS EACH ROW
            // =====================================

            for (const row of rows) {

              try {

                // ===============================
                // VALIDATION
                // ===============================

                if (

                  !row.patient_id ||

                  !row.age ||

                  !row.disease

                ) {

                  failed++;

                  errors.push({

                    patient_id:
                      row.patient_id || 'UNKNOWN',

                    reason:
                      'Missing required fields'

                  });

                  continue;
                }



                // ===============================
                // CALL PYTHON CRYPTO API
                // ===============================

                const cryptoResponse =
                  await axios.post(

                    'http://127.0.0.1:5001/encrypt',

                    {

                      age:
                        row.age || '',

                      gender:
                        row.gender || '',

                      disease:
                        row.disease || '',

                      blood_pressure:
                        row.blood_pressure || '',

                      risk_score:
                        row.risk_score || '',

                    }

                  );



                const encrypted =
                  cryptoResponse.data
                    .encrypted_data;



                // ===============================
                // CREATE RECORD
                // ===============================

                const record =
                  new EncryptedPatientData({

                    record_id:
                      generateRecordId(),

                    patient_id:
                      row.patient_id,

                    encrypted_age:
                      encrypted.age,

                    encrypted_gender:
                      encrypted.gender,

                    encrypted_disease:
                      encrypted.disease,

                    encrypted_blood_pressure:
                      encrypted.blood_pressure,

                    encrypted_risk_score:
                      encrypted.risk_score,

                    disease_category:
                      row.disease,

                    upload_source:
                      'batch_csv',

                    timestamp:
                      new Date(),

                  });



                await record.save();



                // ===============================
                // AUDIT LOG
                // ===============================

                await AuditLog.create({

                  action:
                    'BATCH_UPLOAD',

                  user:
                    'data_owner',

                  details:
                    `Uploaded patient ${row.patient_id}`,

                  status:
                    'success'

                });



                uploaded++;

              } catch (err) {

                console.error(
                  'ROW ERROR:',
                  err.message
                );

                failed++;

                errors.push({

                  patient_id:
                    row.patient_id || 'UNKNOWN',

                  reason:
                    err.message

                });
              }
            }



            // =====================================
            // DELETE TEMP FILE
            // =====================================

            if (
              fs.existsSync(req.file.path)
            ) {

              fs.unlinkSync(
                req.file.path
              );
            }



            // =====================================
            // RESPONSE
            // =====================================

            res.json({

              success: true,

              summary: {

                total_rows:
                  rows.length,

                uploaded,

                failed

              },

              errors

            });

          } catch (processingError) {

            console.error(
              processingError
            );

            res.status(500).json({

              success: false,

              error:
                processingError.message

            });
          }
        });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        error:
          err.message

      });
    }
  }
);



// =====================================================
// GET RECORDS
// =====================================================

app.get('/api/records', async (req, res) => {

  try {

    const records =
      await EncryptedPatientData
        .find()
        .sort({ timestamp: -1 });

    res.json({

      success: true,

      count:
        records.length,

      records

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error:
        err.message

    });
  }
});



// =====================================================
// DASHBOARD STATS
// =====================================================

app.get('/api/stats', async (req, res) => {

  try {

    const totalRecords =
      await EncryptedPatientData
        .countDocuments();



    const totalComputations =
      await ComputationResult
        .countDocuments();



    const today =
      new Date();

    today.setHours(0, 0, 0, 0);



    const todayEncryptions =
      await EncryptedPatientData
        .countDocuments({

          timestamp: {

            $gte: today

          }

        });



    res.json({

      success: true,

      stats: {

        totalRecords,

        todayEncryptions,

        activeMPCSessions: 3,

        totalComputations

      }

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error:
        err.message

    });
  }
});



// =====================================================
// DASHBOARD ANALYTICS
// =====================================================

app.get(
  '/api/dashboard-analytics',

  async (req, res) => {

    try {

      const records =
        await EncryptedPatientData
          .find();



      // =====================================
      // ENCRYPTION GRAPH
      // =====================================

      const encryptionData = [

        { day: 'Mon', records: 0 },
        { day: 'Tue', records: 0 },
        { day: 'Wed', records: 0 },
        { day: 'Thu', records: 0 },
        { day: 'Fri', records: 0 },
        { day: 'Sat', records: 0 },
        { day: 'Sun', records: 0 },

      ];



      records.forEach(record => {

        const d =
          new Date(record.timestamp);

        const dayIndex =
          d.getDay();

        const fixedIndex =
          dayIndex === 0
            ? 6
            : dayIndex - 1;

        encryptionData[
          fixedIndex
        ].records++;

      });



      // =====================================
      // DISEASE DISTRIBUTION
      // =====================================

      const diseaseMap = {};

      records.forEach(record => {

        const disease =
          record.disease_category ||
          'Unknown';

        diseaseMap[disease] =
          (diseaseMap[disease] || 0) + 1;

      });



      const diseaseDistribution =
        Object.keys(diseaseMap)
          .map(key => ({

            name: key,

            value:
              diseaseMap[key]

          }));



      // =====================================
      // RECENT ACTIVITY
      // =====================================

      const recentActivity =
        records
          .slice(-5)
          .reverse()
          .map(record => ({

            id:
              record.record_id,

            type:
              'ENCRYPT',

            func:
              'Patient Record Encryption',

            user:
              'data_owner',

            status:
              'completed',

            time:
              new Date(
                record.timestamp
              ).toLocaleTimeString()

          }));



      res.json({

        success: true,

        analytics: {

          encryptionData,

          diseaseDistribution,

          recentActivity

        }

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        error:
          err.message

      });
    }
  }
);



// =====================================================
// AUDIT LOGS
// =====================================================

app.get('/api/audit-logs', async (req, res) => {

  try {

    const logs =
      await AuditLog
        .find()
        .sort({ timestamp: -1 })
        .limit(500);

    res.json({

      success: true,

      logs

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error:
        err.message

    });
  }
});



// =====================================================
// COMPUTE
// =====================================================

app.post('/api/compute', async (req, res) => {

  try {

    const { function_type } = req.body;

    const records =
      await EncryptedPatientData.find();
// =====================================
// DECRYPT ALL RECORDS
// =====================================

const decryptedRecords = [];

for (const r of records) {

  const response =
    await axios.post(
      'http://127.0.0.1:5001/decrypt',
      {

        encrypted_age:
          r.encrypted_age,

        encrypted_gender:
          r.encrypted_gender,

        encrypted_disease:
          r.encrypted_disease,

        encrypted_blood_pressure:
          r.encrypted_blood_pressure,

        encrypted_risk_score:
          r.encrypted_risk_score
      }
    );

  decryptedRecords.push(
    response.data.decrypted_data
  );
}

    let result = {};

    // =====================================
    // AVERAGE AGE
    // =====================================

    if (
      function_type ===
      'average_age'
    ) {

      const ages =
        decryptedRecords
          .map(r =>
            Number(r.age)
          )
          .filter(n =>
            !isNaN(n)
          );

      const avgAge =
        ages.reduce(
          (a, b) => a + b,
          0
        ) / ages.length;

      result = {

        value:
          avgAge.toFixed(1),

        unit: 'years',

        based_on:
          ages.length
      };
    }

    // =====================================
    // DISEASE FREQUENCY
    // =====================================

    else if (
      function_type ===
      'disease_frequency'
    ) {

      const diseaseMap = {};

      decryptedRecords
        .forEach(r => {

          const disease =
            r.disease ||
            'Unknown';

          diseaseMap[disease] =
            (diseaseMap[disease] || 0) + 1;
        });

      result = {

        breakdown:
          Object.keys(
            diseaseMap
          ).map(key => ({

            name: key,

            count:
              diseaseMap[key]
          }))
      };
    }

    // =====================================
    // AVG RISK SCORE
    // =====================================

    else if (
      function_type ===
      'avg_risk_score'
    ) {

      const risks =
        decryptedRecords
          .map(r =>
            Number(
              r.risk_score
            )
          )
          .filter(n =>
            !isNaN(n)
          );

      const avgRisk =
        risks.reduce(
          (a, b) => a + b,
          0
        ) / risks.length;

      result = {

        value:
          avgRisk.toFixed(1),

        scale: '1-100',

        based_on:
          risks.length
      };
    }

    // =====================================
    // AVG BLOOD PRESSURE
    // =====================================

    else if (
      function_type ===
      'avg_blood_pressure'
    ) {

      const bpValues =
        decryptedRecords
          .map(r =>
            Number(
              r.blood_pressure
            )
          )
          .filter(n =>
            !isNaN(n)
          );

      const avgBP =
        bpValues.reduce(
          (a, b) => a + b,
          0
        ) / bpValues.length;

      result = {

        value:
          avgBP.toFixed(1),

        unit: 'mmHg',

        based_on:
          bpValues.length
      };
    }

    // =====================================
    // RISK SCORE BY DISEASE
    // =====================================

    else if (
      function_type ===
      'risk_score_by_disease'
    ) {

      const diseaseRiskMap = {};

      decryptedRecords
        .forEach(r => {

          const disease =
            r.disease ||
            'Unknown';

          const risk =
            Number(
              r.risk_score
            );

          if (!isNaN(risk)) {

            if (
              !diseaseRiskMap[
                disease
              ]
            ) {

              diseaseRiskMap[
                disease
              ] = [];
            }

            diseaseRiskMap[
              disease
            ].push(risk);
          }
        });

      result = {

        breakdown:
          Object.keys(
            diseaseRiskMap
          ).map(disease => {

            const arr =
              diseaseRiskMap[
                disease
              ];

            const avg =
              arr.reduce(
                (a, b) => a + b,
                0
              ) / arr.length;

            return {

              disease,

              average_risk:
                avg.toFixed(1)
            };
          })
      };
    }

    // =====================================
    // SAVE RESULT
    // =====================================

    const computation =
      new ComputationResult({

        result_id:
          `COMP_${Date.now()}`,

        function_type,

        computed_value:
          result,

      });

    await computation.save();

    // =====================================
    // AUDIT LOG
    // =====================================

    await AuditLog.create({

      action: 'COMPUTE',

      user:
        'research_analyst',

      details:
        `Executed ${function_type}`,

      status: 'success'
    });

    // =====================================
    // RESPONSE
    // =====================================

    res.json({

      success: true,

      result
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error: err.message
    });
  }
});



// =====================================================
// GET RESULTS
// =====================================================

app.get('/api/results', async (req, res) => {

  try {

    const results =
      await ComputationResult
        .find()
        .sort({
          generated_time: -1
        });

    res.json({

      success: true,

      results

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      error:
        err.message

    });
  }
});



// =====================================================
// MPC SESSION
// =====================================================

app.post(
  '/api/mpc/initiate',

  async (req, res) => {

    try {

      const {

        institutions,
        function_type,
        threshold = 2

      } = req.body;

      // =====================================
      // FETCH RECORDS
      // =====================================

      const records =
        await EncryptedPatientData.find();
      // =====================================
// VIRTUAL INSTITUTION RECORD SPLIT
// =====================================

const institutionBuckets = {

  inst_A: [],
  inst_B: [],
  inst_C: []
};

// distribute records across institutions

records.forEach((record, index) => {

  if (index % 3 === 0) {

    institutionBuckets.inst_A
      .push(record);

  } else if (index % 3 === 1) {

    institutionBuckets.inst_B
      .push(record);

  } else {

    institutionBuckets.inst_C
      .push(record);
  }
});
// =====================================
// PARTICIPATING RECORDS
// =====================================

let participatingRecords = [];

institutions.forEach(id => {

  participatingRecords = [

    ...participatingRecords,

    ...(institutionBuckets[id] || [])
  ];
});
      // =====================================
      // DECRYPT RECORDS
      // =====================================

      const decryptedRecords = [];

      for (const r of participatingRecords) {
        const response =
  await axios.post(
    'http://127.0.0.1:5001/decrypt',
    {

      encrypted_age:
        r.encrypted_age,

      encrypted_gender:
        r.encrypted_gender,

      encrypted_disease:
        r.encrypted_disease,

      encrypted_blood_pressure:
        r.encrypted_blood_pressure,

      encrypted_risk_score:
        r.encrypted_risk_score
    }
  );

decryptedRecords.push(
  response.data.decrypted_data
);}
        
      // =====================================
      // COMPUTE REAL RESULT
      // =====================================

      let aggregateResult = {};

      // =====================================
      // DISEASE COUNT
      // =====================================

      if (
        function_type ===
        'sum_disease_count'
      ) {

        const diseaseMap = {};

        decryptedRecords
          .forEach(r => {

            const disease =
              r.disease ||
              'Unknown';

            diseaseMap[disease] =
              (diseaseMap[disease] || 0) + 1;
          });

        aggregateResult =
          diseaseMap;
      }

      // =====================================
      // AVERAGE AGE
      // =====================================

      else if (
        function_type ===
        'average_age'
      ) {

        const ages =
          decryptedRecords
            .map(r =>
              Number(r.age)
            )
            .filter(n =>
              !isNaN(n)
            );

        const avg =
          ages.reduce(
            (a, b) => a + b,
            0
          ) / ages.length;

        aggregateResult = {

          average:
            avg.toFixed(1),

          total_records:
            ages.length
        };
      }

      // =====================================
      // AVERAGE RISK
      // =====================================

      else if (
        function_type ===
        'average_risk'
      ) {

        const risks =
          decryptedRecords
            .map(r =>
              Number(
                r.risk_score
              )
            )
            .filter(n =>
              !isNaN(n)
            );

        const avg =
          risks.reduce(
            (a, b) => a + b,
            0
          ) / risks.length;

        aggregateResult = {

          average_risk:
            avg.toFixed(1),

          high_risk_count:
            risks.filter(
              r => r > 70
            ).length
        };
      }

      // =====================================
      // SESSION ID
      // =====================================

      const session_id =
        `MPC_${Date.now()}`;

      // =====================================
      // AUDIT
      // =====================================

      await AuditLog.create({

        action: 'MPC',

        user: 'admin',

        details:
          `Started MPC session ${session_id}`,

        status: 'success'
      });

      // =====================================
      // RESPONSE
      // =====================================

      res.json({

        success: true,

        session_id,

        institutions,

        function_type,

        threshold,

        total_records:
          decryptedRecords.length,

        aggregateResult,

        timestamp:
          new Date().toISOString()
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        error:
          err.message
      });
    }
  }
);



// =====================================================
// START SERVER
// =====================================================

mongoose
  .connect(MONGODB_URI)

  .then(() => {

    console.log(
      'MongoDB Connected'
    );

    app.listen(PORT, () => {

      console.log(
        `Backend running on http://localhost:${PORT}`
      );

    });
  })

  .catch((err) => {

    console.error(err);

    app.listen(PORT, () => {

      console.log(
        `Backend running WITHOUT MongoDB on http://localhost:${PORT}`
      );

    });
  });

module.exports = app;