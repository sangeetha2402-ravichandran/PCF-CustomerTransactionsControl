import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface Transaction {
  transactionId: string;
  customerId: string;
  accountNumber: string;
  amount: number;
  transactionType: string;
  description: string;
  transactionDate: string;
  status: string;
}

interface CustomApiResponse {
  TransactionsJson: string;
}

export class SampleControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private customerInput!: HTMLInputElement;
  private resultDiv!: HTMLDivElement;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    // Main wrapper
    const wrapper = document.createElement("div");
    wrapper.style.padding = "16px";
    wrapper.style.fontFamily = "Segoe UI";

    // Title
    const title = document.createElement("h3");
    title.innerText = "Customer Transactions";

    // Customer ID label
    const label = document.createElement("label");
    label.innerText = "Customer ID";
    label.style.display = "block";
    label.style.marginBottom = "5px";

    // Customer ID textbox
    this.customerInput = document.createElement("input");
    this.customerInput.type = "text";
    this.customerInput.value = "CUST1001";
    this.customerInput.style.padding = "8px";
    this.customerInput.style.marginRight = "10px";

    // Button
    const button = document.createElement("button");
    button.innerText = "Get Transactions";
    button.style.padding = "8px 14px";

    button.addEventListener("click", () => {
      void this.loadTransactions();
    });

    // Result area
    this.resultDiv = document.createElement("div");
    this.resultDiv.style.marginTop = "20px";

    // Add controls to wrapper
    wrapper.appendChild(title);
    wrapper.appendChild(label);
    wrapper.appendChild(this.customerInput);
    wrapper.appendChild(button);
    wrapper.appendChild(this.resultDiv);

    // Add wrapper to PCF container
    container.appendChild(wrapper);
  }

  private async loadTransactions(): Promise<void> {
    const customerId = this.customerInput.value.trim();

    if (!customerId) {
      this.resultDiv.textContent = "Please enter a Customer ID.";
      return;
    }

    this.resultDiv.textContent = "Loading transactions...";

    try {
      const response = await fetch(
        "/api/data/v9.2/cr805_GetCustomerTransactions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "OData-Version": "4.0",
            "OData-MaxVersion": "4.0",
          },

          body: JSON.stringify({
            CustomerId: customerId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Custom API failed. Status: ${response.status}. ${errorText}`
        );
      }

      const apiResult = (await response.json()) as CustomApiResponse;

      const transactions = JSON.parse(
        apiResult.TransactionsJson
      ) as Transaction[];

      this.displayTransactions(customerId, transactions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred.";

      this.resultDiv.textContent = `Error: ${errorMessage}`;
    }
  }

  private displayTransactions(
    customerId: string,
    transactions: Transaction[]
  ): void {
    // Clear previous results
    this.resultDiv.innerHTML = "";

    const customerHeading = document.createElement("p");

    customerHeading.textContent = `Customer: ${customerId}`;

    this.resultDiv.appendChild(customerHeading);

    if (transactions.length === 0) {
      const noData = document.createElement("p");

      noData.textContent = "No transactions found.";

      this.resultDiv.appendChild(noData);

      return;
    }

    const heading = document.createElement("h3");

    heading.textContent = "Recent Transactions";

    this.resultDiv.appendChild(heading);

    transactions.forEach((transaction: Transaction) => {
      const card = document.createElement("div");

      card.style.border = "1px solid #ddd";

      card.style.padding = "10px";

      card.style.marginBottom = "10px";

      const transactionId = document.createElement("strong");

      transactionId.textContent = transaction.transactionId;

      const details = document.createElement("div");

      details.style.marginTop = "5px";

      details.textContent = `Type: ${transaction.transactionType}
Amount: ${transaction.amount}
Description: ${transaction.description}
Date: ${transaction.transactionDate}
Status: ${transaction.status}`;

      card.appendChild(transactionId);

      card.appendChild(details);

      this.resultDiv.appendChild(card);
    });
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // Nothing required yet
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    // No cleanup required yet
  }
}
