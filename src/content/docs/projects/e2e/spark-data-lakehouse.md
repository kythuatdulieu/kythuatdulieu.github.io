---
title: "Modern Data Engineering: Building a Data Lakehouse with Apache Spark"
description: "A comprehensive guide on building a Data Lakehouse using Apache Spark, Nifi, MinIO, Airflow, Postgres, and Ranger."
---

*This article is based on the architectural concepts and details originally detailed by Mahmud Oyinloye in "Modern Data Engineering: Building a Data Lakehouse with Apache Spark — Vol 1".*

Welcome to a paradigm shift in Data Engineering. This guide introduces a new approach to Data Engineering involving the evolution of traditional Enterprise Data Warehouse and Data Lake techniques into a new Data Lakehouse paradigm that combines prior architectures.

## Prerequisite

This guide breaks down the Data Lakehouse architecture, explaining the services in the ecosystem and how they are used. We will also cover setting up Gitpod as our Integrated Development Environment (IDE).

The Data Lakehouse we're building relies heavily on **Apache Spark**, an open-source unified analytics engine for large-scale data processing that provides an interface for programming clusters with data parallelism and fault tolerance.

- **Data Warehouse**: Acts as the central database (typically relational) where data analysts run business intelligence queries. We use **PostgreSQL** as our Data Warehouse.
- **Data Lake**: A central repository to securely store various types of data of all scales. We use **MinIO S3 Object Storage** as our Data Lake.

The end users of this solution will be Data Consumers such as Data Analysts, Data Scientists, and Business Intelligence Engineers.

## Paradigm Shift: The Motivation behind Data Engineering

We are developing a unified Data Analytics platform that facilitates Business Intelligence, Data Analytics, and Machine Learning. Imagine an on-premise data engineering sandbox where services ingest data from different sources, store that data into a central repository (Data Lake), perform transformations, and then group data into layers in order of the ETL process.

### Introducing the Data Lakehouse Paradigm

A new paradigm emerged that is disciplined at its core and flexible at its edges. A well-architected data lakehouse delivers four key benefits:
1. **Derives insights from both structured and unstructured data.**
2. **Caters to different personas**: It provides a playground for Data Scientists to test hypotheses, allows Analysts to analyze data using their preferred tools, and ensures Business Users get accurate and timely reports.
3. **Facilitates the adoption of a robust governance framework**: Achieves proper governance for correct data types with access granted to the right stakeholders.
4. **Leverages cloud computing**: Adapts to changing organizational requirements to reduce data-to-insight turnover time, offering scalability and flexibility.

## The Architecture

A logical Data Lakehouse Architecture focuses on components that integrate to satisfy specific Functional Requirements (FRs - business-related) and Non-Functional Requirements (NFRs - technical/developer-related).

### Technical Stack

A data lakehouse architecture consists of several layers:

#### Data Ingestion Layer: Apache Nifi
This layer is the integration point between external data providers and the data lakehouse. We use **Apache Nifi** as the ingestion tool for this project.

#### Data Lake Layer: MinIO
Once ingested, data lands into storage where transformations are performed. **MinIO** serves as our central repository. MinIO offers high-performance, S3-compatible object storage, allowing us to develop proof-of-concepts locally without paying for an AWS S3 bucket.

The data lake layer is divided into three significant categories:
- **Raw Layer (Bronze)**: Where data lands from Nifi/external sources, sorted into folders reflecting provenance. Data is stored in its natural form (`.csv`, `.json`, `.parq`).
- **Curated Layer (Silver)**: Contains cleansed, aggregated, enriched, and otherwise processed versions of the raw data.
- **Processed Layer (Gold)**: Contains production-ready data, thoroughly cleansed and run through data quality tools.

#### Data Processing Layer: Apache Spark & Apache Airflow
Data must be transformed or processed to be consumed for insights.
- **Apache Spark**: The multi-language engine for executing data engineering, data science, and machine learning. It powers the compute of the Lakehouse.
- **Apache Airflow**: Used for orchestration. Its scalable, modular architecture uses message queues to orchestrate workers. Pipelines are written in Python for dynamic creation and extensibility.

#### Data Serving Layer: PostgreSQL
Once processed, data is served for downstream consumption. We use **PostgreSQL**, a powerful, open-source object-relational database system known for reliability and performance. It acts as our Data Warehouse.

#### Data Analytics Layer: Jupyter Notebook
The services that extract insights from data. They act as a playground for analysts and data scientists to create reports and experiment with ML models. We use Dockerized **Jupyter Notebook** instances to connect Spark to MinIO and Postgres.

#### Data Security & Governance Layer: Apache Ranger
Data must be governed appropriately. We utilize **Apache Ranger** to enable, monitor, and manage comprehensive data security across the Data Lake platform.

## Modern Data Engineering with Gitpod

Setting up an on-premise Data Lake and Warehouse environment locally using Docker can consume over 20 GB of memory and significantly drain system resources, causing long image build times, OS inconsistencies (like issues with M1 Macbooks), and overheating.

### What is Gitpod?
**Gitpod** is an online Integrated Development Environment (IDE) launched from any GitHub page. It provides a fully working, cloud-based Linux container pre-configured for the project, powered by VS Code. It serves as a cloud-based Docker solution to the Data Lakehouse project.

Since adopting Gitpod, development productivity increases, images and services download faster, collaboration is easier, and OS inconsistencies are eliminated. Developers don't spend their days waiting for builds to complete.

### Getting Started with Gitpod

**Step 0: Login**
Decide which platform to use for access (e.g., GitHub).

**Step 1: Grant Permissions**
Allow Gitpod to make push/pull requests to GitHub directly:
Navigate to `Settings → Integrations → Git Providers → Github → Actions Button`.

**Step 2: Setting Up SSH Keys**
Enable VS Code Desktop via SSH keys. Generate an SSH key on your local machine:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
Save the public/private key pair. Copy the contents of the public key file (`.pub`) and paste it into Gitpod: `Gitpod → SSH Keys → New SSH Keys`.

**Step 3: Development Environment**
1. Head over to GitHub and create a new repository called `modern-datalake`.
2. Navigate back to `Gitpod → Workspaces → New Workspace` and paste the URL of the newly created repository.

**Step 4: All Done!**
You now have a fully functional IDE for our Data Lakehouse, packed with a Docker extension and a cloud VS Code instance.

## Conclusion

Gitpod is a natural extension to GitHub that frees engineering teams from manually setting up local dev environments. All configuration is safely versioned on GitHub.

The architecture introduced—spanning MinIO, Nifi, Spark, Airflow, Postgres, and Ranger—lays the groundwork for a robust, flexible, and scalable Data Lakehouse.
