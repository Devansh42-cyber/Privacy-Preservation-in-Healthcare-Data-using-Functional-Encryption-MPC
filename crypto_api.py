from flask import Flask, request, jsonify

from crypto_core.security.aes import (
    encrypt_value,
    decrypt_value
)

app = Flask(__name__)

# =========================================
# ENCRYPT
# =========================================

@app.route("/encrypt", methods=["POST"])
def encrypt_patient():

    data = request.json

    encrypted_data = {

        "age":
            encrypt_value(
                data["age"]
            ),

        "gender":
            encrypt_value(
                data["gender"]
            ),

        "disease":
            encrypt_value(
                data["disease"]
            ),

        "blood_pressure":
            encrypt_value(
                data["blood_pressure"]
            ),

        "risk_score":
            encrypt_value(
                data["risk_score"]
            )
    }

    return jsonify({

        "success": True,

        "encrypted_data":
            encrypted_data
    })


# =========================================
# DECRYPT
# =========================================

@app.route('/decrypt', methods=['POST'])
def decrypt_route():

    try:

        data = request.get_json()

        decrypted = {

            "age":
                decrypt_value(
                    data["encrypted_age"]
                ),

            "gender":
                decrypt_value(
                    data["encrypted_gender"]
                ),

            "disease":
                decrypt_value(
                    data["encrypted_disease"]
                ),

            "blood_pressure":
                decrypt_value(
                    data["encrypted_blood_pressure"]
                ),

            "risk_score":
                decrypt_value(
                    data["encrypted_risk_score"]
                )
        }

        return jsonify({

            "success": True,

            "decrypted_data":
                decrypted
        })

    except Exception as e:

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


if __name__ == "__main__":

    app.run(
        port=5001,
        debug=True
    )